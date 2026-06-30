import { Component, inject, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { Loading } from '../components/loading/loading';
import Swal from 'sweetalert2';
import { PublicacionesUsuario } from '../../services/publicacionesUsuario';

@Component({
  selector: 'app-estadisticas',
  imports: [FormsModule, Loading],
  templateUrl: './estadisticas.html',
  styleUrl: './estadisticas.css',
})
export class Estadisticas
{
  cargando = signal<boolean>(false);

  publicacionService = inject(PublicacionesUsuario);

  // Primer chart (Publicaciones por usuario) -> Tipo: Barras
  desde = signal<string>('');
  hasta = signal<string>('');
  chart1?: any;

  // Segundo chart (Cantidad total de comentarios por dia) -> Tipo: Lineas
  desdeComentarios = signal<string>('');
  hastaComentarios = signal<string>('');
  chart2?: any;
  
  // Tercer chart (Cantidad de comentarios por publicación) -> Tipo: Torta (Pie)
  desdePubComentarios = signal<string>('');
  hastaPubComentarios = signal<string>('');
  chart3?: any;

  ngOnInit() {
    // Inicializar fechas con valores de ejemplo o vacíos
  }

  async cargarChartLib() {
    const Chart = (await import('chart.js/auto')).default;
    return Chart;
  }

  // --- Gráfico 1: Publicaciones por usuario (Barras) ---
  cargarEstadisticas1() {
    const desde = this.desde();
    const hasta = this.hasta();
    if (!desde || !hasta) return;

    this.publicacionService.traerEstadisticasPublicaciones(desde, hasta).subscribe({
      next: (res) => {
        this.dibujarChart1(res);
      },
      error: (err) => {
        Swal.fire({ title: 'Error al cargar estadísticas', icon: 'error' });
      }
    });
  }

  async dibujarChart1(datos: any[]) {
    const Chart = await this.cargarChartLib();
    if (this.chart1) {
      this.chart1.destroy();
    }

    const labels = datos.map(d => d.nombreUsuario || d.userId);
    const data = datos.map(d => d.cantidadPublicaciones);

    const canvas = document.getElementById('miChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart1 = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de publicaciones',
          data,
          backgroundColor: 'rgb(54, 162, 235)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: 'white', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.2)' }
          },
          x: {
            ticks: { color: 'white' },
            grid: { color: 'rgba(255,255,255,0.2)' }
          }
        },
        plugins: {
          legend: { labels: { color: 'white' } }
        }
      }
    });
  }

  // --- Gráfico 2: Comentarios totales por fecha (Líneas) ---
  cargarEstadisticas2() {
    const desde = this.desdeComentarios();
    const hasta = this.hastaComentarios();
    if (!desde || !hasta) return;

    this.publicacionService.traerEstadisticasComentariosTotales(desde, hasta).subscribe({
      next: (res) => {
        this.dibujarChart2(res);
      },
      error: (err) => {
        Swal.fire({ title: 'Error al cargar estadísticas', icon: 'error' });
      }
    });
  }

  async dibujarChart2(datos: any[]) {
    const Chart = await this.cargarChartLib();
    if (this.chart2) {
      this.chart2.destroy();
    }

    const labels = datos.map(d => d.fecha);
    const data = datos.map(d => d.cantidadComentarios);

    const canvas = document.getElementById('miChartComentarios') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart2 = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de comentarios',
          data,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: 'white', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.2)' }
          },
          x: {
            ticks: { color: 'white' },
            grid: { color: 'rgba(255,255,255,0.2)' }
          }
        },
        plugins: {
          legend: { labels: { color: 'white' } }
        }
      }
    });
  }

  // --- Gráfico 3: Comentarios por publicación (Torta) ---
  cargarEstadisticas3() {
    const desde = this.desdePubComentarios();
    const hasta = this.hastaPubComentarios();
    if (!desde || !hasta) return;

    this.publicacionService.traerEstadisticasComentariosPorPublicacion(desde, hasta).subscribe({
      next: (res) => {
        this.dibujarChart3(res);
      },
      error: (err) => {
        Swal.fire({ title: 'Error al cargar estadísticas', icon: 'error' });
      }
    });
  }

  async dibujarChart3(datos: any[]) {
    const Chart = await this.cargarChartLib();
    if (this.chart3) {
      this.chart3.destroy();
    }

    // Filtrar publicaciones que al menos tengan algún comentario o listarlas todas
    const labels = datos.map(d => d.titulo);
    const data = datos.map(d => d.cantidadComentarios);

    const canvas = document.getElementById('miChartPubComentarios') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart3 = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Comentarios por publicación',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderColor: 'white',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'white' } }
        }
      }
    });
  }

  //Tercer chart: Cantidad de comentarios en cada publicación en un lapso de tiempo (Gráfico de líneas)
  desdePublicacionComentarios = signal<string | null>(null);
  hastaPublicacionComentarios = signal<string | null>(null);
  chartPublicacionComentarios?: any;
  resultadosPublicacionComentarios = signal<{ titulo: string, cantidadComentarios: number }[]>([]);

  cargarEstadisticasPublicacionComentarios()
  {
    const desde = this.desdePublicacionComentarios();
    const hasta = this.hastaPublicacionComentarios();
    if(!desde || !hasta) return;
    if (this.chartPublicacionComentarios)
    {
      this.chartPublicacionComentarios.destroy();
      this.chartPublicacionComentarios = undefined;
    }

    this.resultadosPublicacionComentarios.set([]);
    this.publicacionService.traerComentariosPublicacionStats(desde, hasta).subscribe({
      next: (res) => {
        this.resultadosPublicacionComentarios.set(res);
        this.dibujarChartPublicacionComentarios();
      },
      error: (error) => {
        const err = error.error?.message ?? 'Error al traer estadísticas';
        Swal.fire({ title: err, icon: "error" });
      }
    });
  }

  async dibujarChartPublicacionComentarios()
  {
    const Chart = await this.cargarChartLib();
    if (this.chartPublicacionComentarios)
    {
      this.chartPublicacionComentarios.destroy();
      this.chartPublicacionComentarios = undefined;
    }

    const labels = this.resultadosPublicacionComentarios().map(r => r.titulo);
    const data = this.resultadosPublicacionComentarios().map(r => r.cantidadComentarios);

    const canvas = document.getElementById('miChartPublicacionComentarios') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chartPublicacionComentarios = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de comentarios',
          data,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: 'white'
            },
            title: {
              display: true,
              color: 'white',
              text: 'Comentarios'
            },
            grid: {
              color: 'rgba(255,255,255,0.3)'
            }
          },
          x: {
            ticks: {
              color: 'white'
            },
            title: {
              display: true,
              color: 'white',
              text: 'Publicación'
            },
            grid: {
              color: 'rgba(255,255,255,0.3)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Comentarios por publicación',
            color: 'white'
          }
        }
      }
    });
  }
}
