import {AfterViewInit, Component, ElementRef, inject, NgZone, OnDestroy, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {CurrencyPipe} from '@angular/common';
import {EMPTY, forkJoin, switchMap} from 'rxjs';
import {ReceiptService} from '../../services/receipt.service';
import {ReceiptItem, Supermarket} from '../../models/receipt.model';
import {SUPERMARKETS} from '../../models/supermarket';
import {groceryDialogConfig} from '../../dialogs/dialog-config';
import {ReceiptDeleteDialogComponent, ReceiptDeleteDialogData} from '../../dialogs/receipt-delete-dialog/receipt-delete-dialog.component';

type ScanStep = 'capture' | 'processing' | 'review' | 'success';

@Component({
  selector: 'app-receipt-upload',
  imports: [FormsModule, MatIcon, CurrencyPipe],
  templateUrl: './receipt-upload.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './receipt-upload.component.css'
})
export class ReceiptUploadComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  /** The video is re-created whenever the capture step is shown again; attach the running stream to it. */
  @ViewChild('video')
  private set videoRef(ref: ElementRef<HTMLVideoElement> | undefined) {
    this.video = ref?.nativeElement;
    if (this.video && this.mediaStream) {
      this.video.srcObject = this.mediaStream;
    }
  }

  readonly supermarkets = SUPERMARKETS;

  step: ScanStep = 'capture';
  cameraError: string | null = null;
  cameraReady = false;
  recognizing = false;
  flash = false;

  receiptId = '';
  items: ReceiptItem[] = [];
  supermarket: Supermarket | null = null;
  /** Purchase date printed on the receipt, ISO `YYYY-MM-DD` (as used by `<input type="date">`). */
  receiptDate = '';

  private mediaStream: MediaStream | null = null;
  private video?: HTMLVideoElement;
  private destroyed = false;

  private receiptService = inject(ReceiptService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private ngZone = inject(NgZone);
  private dialog = inject(MatDialog);

  ngAfterViewInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopCamera();
  }

  get runningTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  capture(): void {
    const video = this.video;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas || !video.videoWidth) return;

    navigator.vibrate?.(20);
    this.flash = true;
    setTimeout(() => { this.flash = false; }, 200);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // zone.js does not patch canvas.toBlob: its callback runs outside the Angular zone, so the
    // upload subscriptions started from it would never trigger change detection (UI stuck at "Erkennen").
    canvas.toBlob(blob => this.ngZone.run(() => {
      if (!blob) return;
      this.stopCamera();
      this.processFile(new File([blob], `bon-${Date.now()}.jpg`, {type: 'image/jpeg'}));
    }), 'image/jpeg', 0.9);
  }

  onGallerySelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.stopCamera();
    this.processFile(file);
  }

  selectSupermarket(value: Supermarket): void {
    if (!this.receiptId) return;
    this.supermarket = value;
    this.receiptService.updateSupermarket(this.receiptId, value).subscribe({
      error: () => this.snackBar.open('Supermarkt konnte nicht gespeichert werden', 'Schließen', {duration: 4000})
    });
  }

  saveReceiptDate(value: string): void {
    if (!this.receiptId || !value || value === this.receiptDate) return;
    this.receiptDate = value;
    this.receiptService.updateReceiptDate(this.receiptId, value).subscribe({
      error: () => this.snackBar.open('Datum konnte nicht gespeichert werden', 'Schließen', {duration: 4000})
    });
  }

  saveItem(item: ReceiptItem): void {
    this.receiptService.updateReceiptItem(this.receiptId, item).subscribe({
      next: updated => {
        this.items = this.items.map(i => i.id === updated.id ? updated : i);
      },
      error: () => this.snackBar.open('Änderung konnte nicht gespeichert werden', 'Schließen', {duration: 4000})
    });
  }

  /** Discards the just scanned receipt (e.g. a blurry or duplicate scan) after confirmation. */
  onDiscard(): void {
    if (!this.receiptId) return;
    this.dialog.open<ReceiptDeleteDialogComponent, ReceiptDeleteDialogData, string>(
      ReceiptDeleteDialogComponent, groceryDialogConfig({label: 'Der gescannte Bon', itemCount: this.items.length})
    ).afterClosed().pipe(
      switchMap(result => result === 'confirmed' ? this.receiptService.deleteReceipt(this.receiptId) : EMPTY)
    ).subscribe({
      next: () => {
        this.snackBar.open('Bon verworfen', undefined, {duration: 2500});
        if (!this.destroyed) void this.router.navigate(['/grocery']);
      },
      error: () => this.snackBar.open('Bon konnte nicht gelöscht werden', 'Schließen', {duration: 5000})
    });
  }

  onSave(): void {
    if (!this.receiptDate) {
      this.snackBar.open('Bitte das Datum vom Bon eintragen', 'Schließen', {duration: 4000});
      return;
    }
    this.step = 'success';
    this.snackBar.open('Bon gespeichert', undefined, {duration: 2500});
    setTimeout(() => {
      if (!this.destroyed) void this.router.navigate(['/grocery']);
    }, 1400);
  }

  private processFile(file: File): void {
    this.step = 'processing';
    this.recognizing = true;
    this.receiptService.uploadReceipt(file).subscribe({
      next: response => {
        const id = response.headers.get('Location')?.split('/receipts/')[1] ?? '';
        this.receiptId = id;
        forkJoin({items: this.receiptService.getReceiptItems(id), receipt: this.receiptService.getReceipt(id)}).subscribe({
          next: ({items, receipt}) => {
            this.items = items;
            this.receiptDate = receipt?.receiptDate ?? '';
            this.supermarket = receipt?.supermarket ?? null;
            this.recognizing = false;
            this.step = 'review';
          },
          error: () => this.failProcessing()
        });
      },
      error: () => this.failProcessing()
    });
  }

  private failProcessing(): void {
    this.recognizing = false;
    this.step = 'capture';
    this.cameraError = 'Verarbeitung fehlgeschlagen, bitte erneut versuchen.';
    this.startCamera();
  }

  private startCamera(): void {
    if (this.step !== 'capture' || !navigator.mediaDevices?.getUserMedia) {
      this.cameraError ??= 'Kamera nicht verfügbar. Bitte Bon aus der Galerie wählen.';
      return;
    }
    navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'environment'}}, audio: false})
      .then(stream => {
        // Left the view or moved on (gallery upload) before the camera answered
        if (this.destroyed || this.step !== 'capture') {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        this.mediaStream = stream;
        if (this.video) {
          this.video.srcObject = stream;
        }
      })
      .catch(() => {
        this.cameraError = 'Kamera-Zugriff verweigert. Bitte Bon aus der Galerie wählen.';
      });
  }

  private stopCamera(): void {
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = null;
    this.cameraReady = false;
  }
}
