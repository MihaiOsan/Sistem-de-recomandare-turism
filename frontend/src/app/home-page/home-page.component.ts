import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {


  constructor(private router: Router) { }

  ngOnInit(): void {

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
  }

  onClickStart() {
    if(localStorage.getItem('currentUser') === null) {
      this.router.navigate(['/logIn']);
    }
    else
    {
      this.router.navigate(['/CreateAPlan']);
    }
  }

}
