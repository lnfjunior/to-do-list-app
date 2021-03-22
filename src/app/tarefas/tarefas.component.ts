import { Component, OnInit } from '@angular/core';
import {Tarefas} from "../models/tarefas";
import {TarefasService} from "../services/tarefas.service";
import {NgForm} from "@angular/forms";
import {Layer} from "../models/layer";
import {CatFact} from "../models/cat-fact";
import Swal from 'sweetalert2';

import { faEdit, faEraser, faCheck, faBackward } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tarefas',
  templateUrl: './tarefas.component.html',
  styleUrls: ['./tarefas.component.sass']
})
export class TarefasComponent implements OnInit {

  task = {} as Tarefas;
  isValidEmail: boolean;
  isValidPassword: boolean;
  tasks: Tarefas[];
  catFacts: CatFact[];
  faEdit = faEdit
  faEraser = faEraser
  faCheck = faCheck
  faBackward = faBackward
  PASSWORD: string = 'TrabalheNaSaipos'
  display='none'
  buscaTarefas = 'Pendente'

  constructor(private service: TarefasService) {
    this.tasks = []
    this.catFacts = []
    this.isValidEmail = true
    this.isValidPassword = true
  }

  ngOnInit(): void {
    this.getTasksByStatus(this.buscaTarefas)
  }

  saveTask(form: NgForm) {
    this.service.validEmail(this.task).subscribe((layer: Layer) => {
      this.isValidEmail = layer.format_valid
      if (this.isValidEmail) {
        if (this.task.id) {
          this.service.updateTask(this.task).subscribe(() => {
            this.cleanForm(form);
          });
        } else {
          this.task.status = 'Pendente'
          this.service.saveTask(this.task).subscribe(() => {
            this.cleanForm(form);
          });
        }
      }
    });
  }

  setPasswordSupervisor(form: NgForm) {
    if (this.task.senha_supervisor !== this.PASSWORD) {
      this.isValidPassword = false
    } else {
      this.onCloseHandled()
      this.task.status = this.task.status === 'Pendente' ? 'Concluído' : 'Pendente'
      this.service.changeStatus(this.task).subscribe(() => {
        this.buscaTarefas === 'todos' ? this.getTasks() : this.getTasksByStatus(this.buscaTarefas)
        this.cleanFormModal(form)
      });
    }
  }

  openModal(){
    this.display='block';
  }

  onCloseHandled(){
    this.display='none';
  }

  changeStatus(task: Tarefas) {
    this.task = task
    if (task.status === 'Concluído' && task.qtd_pendente >= 2) {
      Swal.fire(
        'Mudança de Status?',
        'O máximo permitido é de duas mudanças.',
        'info'
      )
    } else if(task.status === 'Concluído' && task.qtd_pendente < 2) {
      this.openModal()
    }
    else {
      task.status = task.status === 'Pendente' ? 'Concluído' : 'Pendente'
      this.service.changeStatus(task).subscribe(() => {
        this.buscaTarefas === 'todos' ? this.getTasks() : this.getTasksByStatus(this.buscaTarefas)
        this.task = {} as Tarefas
      });
    }
  }

  getTasks() {
    this.buscaTarefas = 'todos'
    this.service.getTasks().subscribe((tasks: Tarefas[]) => {
      this.tasks = tasks;
    });
  }

  getTasksByStatus(status: string) {
    this.buscaTarefas = status
    this.service.getTasksByStatus(status).subscribe((tasks: Tarefas[]) => {
      this.tasks = tasks;
    });
  }

  deleteTask(task: Tarefas) {
    Swal.fire({
      title: 'Você tem certeza que deseja apagar este registro?',
      text: "Este processo é irreversível!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sim, pode apagar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteTask(task).subscribe(() => {
          this.buscaTarefas === 'todos' ? this.getTasks() : this.getTasksByStatus(this.buscaTarefas)
        });
        Swal.fire(
          'Apagado!',
          'O registro foi apagado.',
          'success'
        )
      }
    })
  }

  editTask(task: Tarefas) {
    this.task = { ...task };
  }

  // limpa o formulario
  cleanForm(form: NgForm) {
    this.buscaTarefas === 'todos' ? this.getTasks() : this.getTasksByStatus(this.buscaTarefas)
    form.resetForm();
    this.task = {} as Tarefas;
  }

  // limpa o formulario
  cleanFormModal(form: NgForm) {
    form.resetForm();
    this.isValidPassword = true
    this.task = {} as Tarefas
  }


  noTasks() {
    let task = {} as Tarefas
    this.service.getCatFacts().subscribe((catFacts: CatFact[]) => {
      this.catFacts = catFacts;
      for (let catFact of this.catFacts) {
        task.nome_usuario = 'Eu'
        task.email_usuario = 'eu@me.com'
        task.descricao = catFact.text
        task.status = 'Pendente'
        this.service.saveTask(task).subscribe(() => {
          this.buscaTarefas === 'todos' ? this.getTasks() : this.getTasksByStatus(this.buscaTarefas)
        });
      }
    });
  }

}
