import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../../core/services/engine.service';

type EngineState = 'idle' | 'countdown' | 'ignition' | 'liftoff' | 'complete' | 'error';

@Component({
  selector: 'voy-admin-engine',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-engine.component.html',
  styleUrl: './admin-engine.component.scss',
})
export class AdminEngineComponent {
  private engine = inject(EngineService);

  state = signal<EngineState>('idle');
  countdown = signal(3);
  errorMessage = signal('');
  duration = signal(0);
  completedAt = signal('');

  reset(): void {
    this.state.set('idle');
    this.countdown.set(3);
    this.errorMessage.set('');
    this.duration.set(0);
    this.completedAt.set('');
  }

  async launch(): Promise<void> {
    this.state.set('countdown');
    this.countdown.set(3);

    for (let i = 3; i >= 1; i--) {
      this.countdown.set(i);
      await this.sleep(800);
    }

    this.state.set('ignition');
    await this.sleep(600);

    this.state.set('liftoff');
    const launchTime = performance.now();

    this.engine.tick().subscribe({
      next: () => {
        this.duration.set(Math.round((performance.now() - launchTime) * 10) / 10);
        this.completedAt.set(new Date().toLocaleTimeString());
        this.state.set('complete');
      },
      error: (err) => {
        this.duration.set(Math.round((performance.now() - launchTime) * 10) / 10);
        this.completedAt.set(new Date().toLocaleTimeString());
        this.errorMessage.set(err.error?.message ?? err.message ?? 'Connection failed');
        this.state.set('error');
      },
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }
}
