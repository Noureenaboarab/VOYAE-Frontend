import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EngineService } from '../../../core/services/engine.service';

type EngineState = 'idle' | 'running' | 'complete' | 'error';

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
  errorMessage = signal('');
  duration = signal(0);
  completedAt = signal('');

  reset(): void {
    this.state.set('idle');
    this.errorMessage.set('');
    this.duration.set(0);
    this.completedAt.set('');
  }

  launch(): void {
    this.state.set('running');
    const start = performance.now();

    this.engine.tick().subscribe({
      next: () => {
        this.duration.set(Math.round((performance.now() - start) * 10) / 10);
        this.completedAt.set(new Date().toLocaleTimeString());
        this.state.set('complete');
      },
      error: (err) => {
        this.duration.set(Math.round((performance.now() - start) * 10) / 10);
        this.completedAt.set(new Date().toLocaleTimeString());
        this.errorMessage.set(err.error?.message ?? err.message ?? 'Connection failed');
        this.state.set('error');
      },
    });
  }
}
