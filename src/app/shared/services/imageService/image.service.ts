import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl = environment.apiURL; // Cambia esto por la URL de tu backend

  constructor(private http: HttpClient) {}

  getImage(imageName: string, imageSize: number): Observable<Blob> {
    console.log(imageSize)
    const params = new HttpParams()
      .set('imageName', imageName)
      .set('imageSize', imageSize.toString());

    console.log(`${this.baseUrl}/image`)
    return this.http.get(`${this.baseUrl}/image`, { params, responseType: 'blob' });
  }
}
