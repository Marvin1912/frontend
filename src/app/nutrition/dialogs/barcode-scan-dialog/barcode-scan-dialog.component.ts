import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatError, MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatMiniFabButton} from '@angular/material/button';
import {FoodDraft} from '../../models/nutrition.model';
import {NutritionService} from '../../services/nutrition.service';

/**
 * Minimal shape of the native BarcodeDetector API (not yet in lib.dom).
 * Used for live camera scanning where the browser supports it.
 */
interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

type BarcodeDetectorCtor = new (options?: {formats: string[]}) => BarcodeDetectorLike;

/** Valid EAN/UPC: 8–14 digits (matches the backend's format guard). */
const EAN_PATTERN = /^\d{8,14}$/;

/**
 * Resolve a packaged food by barcode. Where the browser exposes BarcodeDetector
 * the camera is scanned live; otherwise (or in addition) the user can type the
 * EAN. On a hit the dialog closes with the EAN, which the foods view looks up
 * and prefills as a BARCODE-sourced food.
 */
@Component({
  selector: 'app-barcode-scan-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatError,
    MatHint,
    MatInput,
    MatIcon,
    MatButton,
    MatMiniFabButton
  ],
  templateUrl: './barcode-scan-dialog.component.html',
  styleUrl: './barcode-scan-dialog.component.css'
})
export class BarcodeScanDialogComponent implements AfterViewInit, OnDestroy {

  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;

  manualEan = new FormControl('', {nonNullable: true, validators: [Validators.pattern(EAN_PATTERN)]});

  /** Whether this browser can scan via the camera at all. */
  cameraSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
  cameraActive = false;
  looking = false;
  message = '';

  /** Set once a barcode lookup succeeds, pending user confirmation. */
  foundFood: FoodDraft | null = null;

  private dialogRef = inject(MatDialogRef<BarcodeScanDialogComponent>);
  private service = inject(NutritionService);
  private cdr = inject(ChangeDetectorRef);

  private stream?: MediaStream;
  private detector?: BarcodeDetectorLike;
  private timer?: ReturnType<typeof setInterval>;
  private detecting = false;
  private handled = false;

  ngAfterViewInit(): void {
    if (this.cameraSupported) {
      void this.startCamera();
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  private async startCamera(): Promise<void> {
    try {
      const Ctor = (window as unknown as {BarcodeDetector: BarcodeDetectorCtor}).BarcodeDetector;
      this.detector = new Ctor({formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e']});
      this.stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: 'environment'}});
      const video = this.videoRef?.nativeElement;
      if (!video) return;
      video.srcObject = this.stream;
      await video.play();
      this.cameraActive = true;
      this.message = '';
      this.cdr.markForCheck();
      this.timer = setInterval(() => void this.scanFrame(), 400);
    } catch {
      this.cameraActive = false;
      this.message = 'Kamera nicht verfügbar – Barcode bitte eingeben.';
      this.cdr.markForCheck();
    }
  }

  private async scanFrame(): Promise<void> {
    const video = this.videoRef?.nativeElement;
    if (!this.detector || !video || this.detecting || this.handled) return;
    this.detecting = true;
    try {
      const codes = await this.detector.detect(video);
      const hit = codes.map(c => c.rawValue).find(v => EAN_PATTERN.test(v));
      if (hit) this.onEan(hit);
    } catch {
      // Transient decode failures are expected between frames; ignore.
    } finally {
      this.detecting = false;
    }
  }

  lookupManual(): void {
    const ean = this.manualEan.value.trim();
    if (!EAN_PATTERN.test(ean)) {
      this.manualEan.markAsTouched();
      return;
    }
    this.onEan(ean);
  }

  private onEan(ean: string): void {
    if (this.handled) return;
    this.handled = true;
    this.stopCamera();
    this.looking = true;
    this.message = '';
    this.cdr.markForCheck();
    this.service.getFoodByBarcode(ean).subscribe({
      next: draft => {
        this.looking = false;
        this.foundFood = draft;
        this.cdr.markForCheck();
      },
      error: err => {
        this.looking = false;
        this.message = err.status === 404
          ? `Kein Treffer für ${ean}.`
          : 'Barcode-Suche fehlgeschlagen.';
        // Allow another attempt.
        this.handled = false;
        if (this.cameraSupported) void this.startCamera();
        this.cdr.markForCheck();
      }
    });
  }

  /** User confirmed the matched product; hand off to the food-edit-dialog. */
  confirmFound(): void {
    if (!this.foundFood) return;
    this.dialogRef.close(this.foundFood);
  }

  /** User rejected the match; return to scanning. */
  rescan(): void {
    this.foundFood = null;
    this.handled = false;
    this.message = '';
    this.manualEan.reset('');
    if (this.cameraSupported) void this.startCamera();
    this.cdr.markForCheck();
  }

  private stopCamera(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = undefined;
    this.cameraActive = false;
  }
}
