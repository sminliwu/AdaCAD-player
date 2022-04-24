import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { SystemsService } from '../../../../core/provider/systems.service';
import { OpNode, TreeService } from '../../../provider/tree.service';



@Component({
  selector: 'app-inlet',
  templateUrl: './inlet.component.html',
  styleUrls: ['./inlet.component.scss']
})
export class InletComponent implements OnInit {

  @Input() opid:  number;
  @Input() inletid:  number;
  @Input() type:  'main' | 'number' | 'notation' | 'system' | 'color';
  @Input() dynamic: boolean;
  @Output() onInputSelected = new EventEmitter <any>(); 
  @Output() onConnectionRemoved = new EventEmitter <any>(); 
  @Output() onInletChange = new EventEmitter <any>(); 

  fc: FormControl;
  textValidate: any;
  all_system_codes: Array<any>;
  opnode: OpNode;

  constructor(public tree: TreeService, private systems: SystemsService) { 
    this.all_system_codes = this.systems.weft_systems.map(el => el.name);
  

  }

  ngOnInit(): void {
    this.opnode = this.tree.getOpNode(this.opid);
    this.fc = new FormControl(this.opnode.inlets[this.inletid]);


  }

  inputSelected(){
    this.onInputSelected.emit(this.inletid);
  }

  removeConnectionTo(sd_id: number, ndx: number){
    this.onConnectionRemoved.emit({from: sd_id, to: this.opid});
  }

  getInputName(id: number) : string {
    const sd = this.tree.getDraft(id);
    if(sd === null || sd === undefined) return "null draft"
    return sd.getName();
  }

  inletChange(value: any){
    const opnode: OpNode = <OpNode> this.tree.getNode(this.opid);
    this.fc.setValue(value);
    
    switch(this.type){
      case 'main':
        opnode.inlets[this.inletid] = 0;
        break;
      case 'number':
        opnode.inlets[this.inletid] = value;
        break;
      case 'system':
        opnode.inlets[this.inletid] = this.systems.weft_systems.findIndex(el => el.name === value);
        break;
      case 'color':
        opnode.inlets[this.inletid] = value;
        break;
      case 'notation':
        opnode.inlets[this.inletid] = value;
        break;

    }

    this.onInletChange.emit({id: this.inletid});
   
  }






}
