import { NgModule } from '@angular/core';

import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ColorPickerModule } from 'primeng/colorpicker';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { LightboxModule } from 'primeng/lightbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SharedModule } from 'primeng/shared';
import { SliderModule } from 'primeng/slider';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { GrowlModule } from 'primeng/growl';

@NgModule({
  exports: [
    AccordionModule,
    ButtonModule,
    CheckboxModule,
    ColorPickerModule,
    DialogModule,
    FileUploadModule,
    InputTextModule,
    LightboxModule,
    OverlayPanelModule,
    SelectButtonModule,
    SidebarModule,
    SharedModule,
    SliderModule,
    TabMenuModule,
    TabViewModule,
    TooltipModule,
    GrowlModule,
  ],
  declarations: [],
})
export class PrimengModule {
}
