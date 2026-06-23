
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { Loading } from '../components/loading/loading';
import { UsuariosService } from '../../services/usuariosService';
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
  cargando = signal<boolean>(true);

  usuarioService = inject(UsuariosService);
  publicacionService = inject(PublicacionesUsuario);
  arrayUsuarios = signal<string[] | null >(null);

  //Primer chart
  desde = signal<string | null>(null);
  hasta = signal<string | null>(null);

  resultados = signal<{ nombreUsuario: string, cantidadPublicaciones: number }[]>([]);
  procesados = signal<number>(0);
  chart?: any;

  //Segundo chart
  desdeComentarios = signal<string | null>(null);
  hastaComentarios = signal<string | null>(null);
  chartComentarios?: any;
  
  resultadosComentarios = signal<{ nombreUsuario: string, cantidadComentarios: number }[]>([]);
  procesadosComentarios = signal<number>(0);


  ngOnInit()
  {
    this.cargando.set(true);
    this.traerUsuarios();
  }

  async cargarChartLib()
  {
    const Chart = (await import('chart.js/auto')).default;
    return Chart;
  }

  traerUsuarios()
  {
    this.usuarioService.traerIdsUsuarios().subscribe(
    {
      next: (res) =>
      {
        this.arrayUsuarios.set(res)
      },
      error: (error) =>
      {
        const err = error.error.message;
        Swal.fire
        ({
          title: err,
          icon: "error",
          draggable: true
        });
      },
      complete: () =>
        {
          this.cargando.set(false);
      }
    });
  }

///////////////////////////////////////
  cargarEstadisticas()
  {
    const desde = this.desde();
    const hasta = this.hasta();
    if(!desde || !hasta) return;
    if (this.chart)
    {
      this.chart.destroy();
      this.chart = undefined;
    }

    this.resultados.set([]);
    this.procesados.set(0);
    this.estadisticasPublicaciones(desde, hasta);
  }
  estadisticasPublicaciones(desde : string, hasta: string)
  {
    for(const id of this.arrayUsuarios()!)
    {
      this.publicacionService.traerMisPublicacionesCount(id, desde, hasta).subscribe(res =>
      {
        const nombre = res?.nombreUsuario ?? id;
        const cantidad = res?.cantidadPublicaciones ?? 0;

        this.procesados.set(this.procesados() + 1);
        if (cantidad > 0)
        {
          this.resultados.set([...this.resultados(), { nombreUsuario: nombre, cantidadPublicaciones: cantidad }]);
        }
        if (this.procesados() === this.arrayUsuarios()!.length)
        {
          this.dibujarChart();
        }
      });
    }
  }
  async dibujarChart()
  {
    const Chart = await this.cargarChartLib();
    if (this.chart)
    {
      this.chart.destroy();
      this.chart = undefined;
    }
    // labels y datos
    const labels = this.resultados().map(r => r.nombreUsuario);
    const data = this.resultados().map(r => r.cantidadPublicaciones);

    // obtener contexto del canvas
    const canvas = document.getElementById('miChart') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx,
    {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de publicaciones',
          data,
          // opcional: Chart.js pone colores por defecto, si querés un solo color lo podés setear aquí
          backgroundColor: 'rgb(14, 39, 48)',
        }]
      },
      options:
      {
        responsive: true,
        maintainAspectRatio: false,
        scales:{
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 3,
              color: 'white'
            },
            title: {
              display: true,
              color: 'white',
              text: 'Cantidad de publicaciones'
            },
            grid: {
              color: 'rgba(255,255,255,0.3)' 
            },
          },
          x: {
            ticks: {
              color: 'white'
            },
            title: {
              display: true,
              color: 'white',
              text: 'Usuario'
            },
            grid: {
              color: 'rgba(255,255,255,0.3)' 
            },
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

///////////////////////////////////////
  cargarEstadisticasComentarios()
  {
    const desde = this.desdeComentarios();
    const hasta = this.hastaComentarios();
    if(!desde || !hasta) return;
    if (this.chartComentarios)
    {
      this.chartComentarios.destroy();
      this.chartComentarios = undefined;
    }

    this.resultadosComentarios.set([]);
    this.procesadosComentarios.set(0);
    this.estadisticasComentarios(desde, hasta);
  }
  estadisticasComentarios(desde : string, hasta: string)
  {
    for(const id of this.arrayUsuarios()!)
    {
      this.publicacionService.traerMisComentarios(id, desde, hasta).subscribe(res =>
      {
        const nombre = res?.nombreUsuario ?? id;
        const cantidad = res?.cantidadComentarios ?? 0;

        this.procesadosComentarios.set(this.procesadosComentarios() + 1);
        if (cantidad > 0)
        {
          this.resultadosComentarios.set([...this.resultadosComentarios(), { nombreUsuario: nombre, cantidadComentarios: cantidad }]);
        }
        if (this.procesadosComentarios() === this.arrayUsuarios()!.length)
        {
          this.dibujarChartComentarios();
        }
      });
    }
  }
  async dibujarChartComentarios()
  {
    const Chart = await this.cargarChartLib();
    if (this.chartComentarios)
    { 
      this.chartComentarios.destroy();
      this.chartComentarios = undefined;
    }

    // labels y datos para el gráfico de torta
    const labels = this.resultadosComentarios().map(r => r.nombreUsuario);
    const data = this.resultadosComentarios().map(r => r.cantidadComentarios);

    // obtener canvas
    const canvas = document.getElementById('miChartComentarios') as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this.chartComentarios = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Cantidad de comentarios',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: 'white',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              color: 'white'
            }
          },
          title: {
            display: true,
            text: 'Comentarios por usuario',
            color: 'white'
          }
        }
      }
    });
  }
}


