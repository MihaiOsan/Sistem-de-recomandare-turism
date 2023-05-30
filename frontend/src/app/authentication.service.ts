import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './model';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(`http://localhost:8080/user/login/local`, { email: email, password: password })
            .pipe(map(user => {
              if (user.email === email) {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
              }
              this.reloadPage();
              return user;
            }));
    }

    loginGoogle() {
      window.location.href = `http://localhost:8080/oauth2/authorization/google`
    }

    loginFacebook() {
      window.location.href = `http://localhost:8080/oauth2/authorization/facebook`
    }

    loginSocialPass(email: string) {
      return this.http.get<any>(`http://localhost:8080/user/`+email)
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.reloadPage();
        return user;
      }));
    }
      

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('filterSort');
        localStorage.removeItem('filterType');
        localStorage.removeItem('mapCenter');
        localStorage.removeItem('mapRange');
        this.currentUserSubject.next(null!);
    }

    register(name: string, phoneNumber: string, username: string, password: string) {
      return this.http.post<any>(`http://localhost:8080/user/register/local`, { name: name, email: username, password: password, phone: phoneNumber })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.reloadPage();
        return user;
      }));
    }

    codeVerification(email: string, code: string) {
      return this.http.post<any>(`http://localhost:8080/user/register/local/veriffication`, { email: email, code: code })
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.reloadPage();
        return user;
      }));
    }

    resetCode(email: string) {
      return this.http.post<any>(`http://localhost:8080/user/resendVerificationCode`, email)
      .pipe(map(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.reloadPage();
        return user;
      }));
    }

    reloadPage() {
      setTimeout(()=>{
        window.location.reload();
      }, 100);
  }
}
