import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-plant-detail',
  imports: [],
  templateUrl: './plant-detail.component.html',
  styleUrl: './plant-detail.component.css'
})
export class PlantDetailComponent {

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
  }

}
