import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
import { MapCenterService } from '../services/map-center-service.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {


  constructor(private authentificationService: AuthenticationService, private router: Router, private el: ElementRef, private renderer: Renderer2, private mapCenterService: MapCenterService) { }

  currentUser: any;

  ngOnInit(): void {
    this.currentUser = this.authentificationService.currentUserValue;
  }

  onLogout() {
    this.authentificationService.logout();
    this.router.navigate(['/home']);
    this.authentificationService.reloadPage();
  }

  private isOpen = false;


  toggleOpen() {
    this.isOpen = !this.isOpen;
    const dropdownMenu = this.el.nativeElement.querySelector('.dropdown-menu');
    if (this.isOpen) {
      this.renderer.addClass(dropdownMenu, 'show');
    } else {
      this.renderer.removeClass(dropdownMenu, 'show');
    }
  }

  onRoute() {
    if (this.isOpen) {
      this.isOpen = !this.isOpen;
      const dropdownMenu = this.el.nativeElement.querySelector('.dropdown-menu');
      this.renderer.removeClass(dropdownMenu, 'show');
    }
    if(this.router.url != '/Attractions'){
      console.log(this.router.url);
    }
  }
}
