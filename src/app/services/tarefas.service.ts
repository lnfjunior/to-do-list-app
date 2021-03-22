import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {Tarefas} from "../models/tarefas";
import {catchError, retry} from "rxjs/operators";
import {CatFact} from "../models/cat-fact";
import {Layer} from "../models/layer";

@Injectable({
  providedIn: 'root'
})
export class TarefasService {

  url = environment.apiUrl + '/tarefas';

  constructor(private httpClient: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  }

  // Obtem todos os Tarefas
  getTasks(): Observable<Tarefas[]> {
    return this.httpClient.get<Tarefas[]>(this.url + '/getTasks')
      .pipe(
        retry(2),
        catchError(this.handleError))
  }

  // Estou sem tarefas
  getCatFacts(): Observable<CatFact[]> {
    return this.httpClient.get<CatFact[]>('https://cat-fact.herokuapp.com/facts/random?animal_type=dog&amount=3')
      .pipe(
        retry(2),
        catchError(this.handleError))
  }

  // Obtem um tarefa pelo id
  getTaskById(id: number): Observable<Tarefas> {
    return this.httpClient.get<Tarefas>(this.url + '/getTaskById?id=' + id)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // Obtem um tarefa pelo id
  getTasksByStatus(status: string): Observable<Tarefas[]> {
    return this.httpClient.get<Tarefas[]>(this.url + '/getTasksByStatus?status=' + status)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // salva um tarefa
  saveTask(tarefa: Tarefas): Observable<Tarefas> {
    return this.httpClient.post<Tarefas>(this.url + '/save', JSON.stringify(tarefa), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // mudar status de uma tarefa
  changeStatus(tarefa: Tarefas): Observable<Tarefas> {
    return this.httpClient.post<Tarefas>(this.url + '/changeStatus', JSON.stringify(tarefa), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  // utualiza um tarefa
  updateTask(task: Tarefas): Observable<Tarefas> {
    return this.httpClient.put<Tarefas>(this.url + '/update', JSON.stringify(task), this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  // deleta um tarefa
  deleteTask(task: Tarefas) {
    return this.httpClient.delete<Tarefas>(this.url + '/delete?id=' + task.id, this.httpOptions)
      .pipe(
        retry(1),
        catchError(this.handleError)
      )
  }

  validEmail(task: Tarefas) {
    return this.httpClient.get<Layer>('https://apilayer.net/api/check?access_key='+environment.mailboxLayerKey+'&email=' + task.email_usuario)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }



  // Manipulação de erros
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Erro ocorreu no lado do client
      errorMessage = error.error.message;
    } else {
      // Erro ocorreu no lado do servidor
      errorMessage = `Código do erro: ${error.status}, ` + `menssagem: ${error.message}`;
    }
    return throwError(errorMessage);
  };
}
