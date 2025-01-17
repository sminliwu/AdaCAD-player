import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatChipsModule } from '@angular/material/chips';
import { ScrollingModule} from '@angular/cdk/scrolling';

<<<<<<< HEAD
import { WeaverComponent } from './weaver.component';
import { TopbarComponent } from './topbar/topbar.component';
import { DesignComponent } from './tool/design/design.component';
import { ShuttlesComponent } from './tool/shuttles/shuttles.component';
import { ShuttlesModal } from './modal/shuttles/shuttles.modal';
import { PatternsComponent } from './tool/patterns/patterns.component';

import { CoreModule } from '../core/core.module';
import { PatternModal } from './modal/pattern/pattern.modal';
import { ConnectionModal } from './modal/connection/connection.modal';
import { InitModal } from './modal/init/init.modal';
import { LabelModal } from './modal/label/label.modal';
import { SelvedgeModal } from './modal/selvedge/selvedge.modal';
import { ShapeModal } from './modal/shape/shape.modal';


@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    ColorPickerModule,
  ],
  declarations: [
    WeaverComponent, 
    TopbarComponent, 
    DesignComponent, 
    ShuttlesComponent, 
    PatternsComponent,
    ShuttlesModal,
    PatternModal,
    ConnectionModal,
    InitModal,
    LabelModal,
    SelvedgeModal,
    ShapeModal
  ],
  entryComponents: [
    ShuttlesModal,
    PatternModal,
    ConnectionModal,
    InitModal,
    LabelModal,
    SelvedgeModal,
    ShapeModal
  ],
=======

import { CoreModule } from '../core/core.module';
import { WeaverComponent } from './weaver.component';

@NgModule({
    declarations: [
        WeaverComponent
    ],
    imports: [
        CommonModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        ColorPickerModule,
        MatChipsModule,
        ScrollingModule
    ],
    exports: [
        WeaverComponent
    ]
>>>>>>> upstream/master
})
export class WeaverModule { }
