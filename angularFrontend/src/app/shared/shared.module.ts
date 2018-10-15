import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
    imports: [
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class SharedModule {}
