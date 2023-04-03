import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private authentificationService: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
  }

  logoutCurrentUser() {
    this.authentificationService.logout();
    this.router.navigate(['/home']);
    this.authentificationService.reloadPage();
  }
}
