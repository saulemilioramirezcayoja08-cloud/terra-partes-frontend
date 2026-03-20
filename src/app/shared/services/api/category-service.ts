import {inject, Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {map, Observable} from 'rxjs';
import {api_response} from '../../models/common/response.model';
import {category_list_response} from '../../models/api/response/category-list-response.model';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  // dependencias
  private http = inject(HttpClient);

  // configuracion
  private api_url = `${environment.api_url}/categories`;

  // obtiene lista de categorias
  get_categories(): Observable<category_list_response[]> {
    return this.http.get<api_response<category_list_response[]>>(this.api_url).pipe(
      map(response => response.data)
    );
  }
}
