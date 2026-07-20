import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from '../home/profile.component';
import { MyCVsComponent } from './my-cvs/my-cvs.component';

@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardComponent,
    ProfileComponent,
    MyCVsComponent
  ]
})
export class DashboardModule { }