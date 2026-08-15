import {AfterViewInit, Component, ElementRef, inject, OnDestroy, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CurrencyPipe} from '@angular/common';
import {ReceiptService} from '../../services/receipt.service';
import {ReceiptItem, Supermarket} from '../../models/receipt.model';

type ScanStep = 'capture' | 'processing' | 'review' | 'success';

interface SupermarketOption {
  value: Supermarket;
  label: string;
}

@Component({
  selector: 'app-receipt-upload',
  imports: [FormsModule, MatIcon, CurrencyPipe],
  templateUrl: './receipt-upload.component.html',
  styleUrl: './receipt-upload.component.css'
})
export class ReceiptUploadComponent implements AfterViewInit, OnDestroy {

  @ViewChild('video') private videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  readonly supermarkets: SupermarketOption[] = [
    {value: 'LIDL', label: 'Lidl'},
    {value: 'EDEKA', label: 'Edeka'},
    {value: 'REWE', label: 'Rewe'}
  ];

  step: ScanStep = 'capture';
  cameraError: string | null = null;
  recognizing = false;

  receiptId = '';
  items: ReceiptItem[] = [];
  supermarket: Supermarket | null = null;

  private mediaStream: MediaStream | null = null;

  private receiptService = inject(ReceiptService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ngAfterViewInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  get runningTotal(): number {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  capture(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas || !video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      this.stopCamera();
      this.processFile(new File([blob], `bon-${Date.now()}.jpg`, {type: 'image/jpeg'}));
    }, 'image/jpeg', 0.9);
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

  saveItem(item: ReceiptItem): void {
    this.receiptService.updateReceiptItem(this.receiptId, item).subscribe({
      next: updated => {
        this.items = this.items.map(i => i.id === updated.id ? updated : i);
      },
      error: () => this.snackBar.open('Änderung konnte nicht gespeichert werden', 'Schließen', {duration: 4000})
    });
  }

  onSave(): void {
    this.step = 'success';
    this.snackBar.open('Bon gespeichert', undefined, {duration: 2500});
    setTimeout(() => void this.router.navigate(['/grocery']), 1400);
  }

  private processFile(file: File): void {
    this.step = 'processing';
    this.recognizing = true;
    this.receiptService.uploadReceipt(file).subscribe({
      next: response => {
        const id = response.headers.get('Location')?.split('/receipts/')[1] ?? '';
        this.receiptId = id;
        this.receiptService.getReceiptItems(id).subscribe({
          next: items => {
            this.items = items;
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
        this.mediaStream = stream;
        if (this.videoRef) {
          this.videoRef.nativeElement.srcObject = stream;
        }
      })
      .catch(() => {
        this.cameraError = 'Kamera-Zugriff verweigert. Bitte Bon aus der Galerie wählen.';
      });
  }

  private stopCamera(): void {
    this.mediaStream?.getTracks().forEach(track => track.stop());
    this.mediaStream = null;
  }
}
