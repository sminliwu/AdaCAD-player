import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { OpNode, TreeService } from '../../../provider/tree.service';
import { BoolParam, FileParam, NumParam, OperationParam, SelectParam, StringParam } from '../../../provider/operation.service';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}



@Component({
  selector: 'app-parameter',
  templateUrl: './parameter.component.html',
  styleUrls: ['./parameter.component.scss']
})
export class ParameterComponent implements OnInit {
  
  textValidate: any;
  fc: FormControl;
  opnode: OpNode;

  @Input() param:  NumParam | StringParam | SelectParam | BoolParam | FileParam;
  @Input() opid:  number;
  @Input() paramid:  number;
  @Output() onOperationParamChange = new EventEmitter <any>(); 
  @Output() onFileUpload = new EventEmitter <any>(); 

  //you need these to access values unique to each type.
  numparam: NumParam;
  boolparam: BoolParam;
  stringparam: StringParam;
  selectparam: SelectParam;
  fileparam: FileParam;


  constructor(public tree: TreeService) { 
    this.textValidate = new MyErrorStateMatcher();
  }

  ngOnInit(): void {

    this.opnode = this.tree.getOpNode(this.opid);

     //initalize the form controls for the parameters: 

      switch(this.param.type){
        case 'number':
          this.numparam = <NumParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'boolean':
          this.boolparam = <BoolParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'select':
          
          this.selectparam = <SelectParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'file':
          this.fileparam = <FileParam> this.param;
          this.fc = new FormControl(this.param.value);
          break;

        case 'string':
          //if(this.fc.hasError('pattern') || this.fc.hasError('required')) return;
          this.stringparam = <StringParam> this.param;
          this.fc = new FormControl(this.stringparam.value, [Validators.required, Validators.pattern((<StringParam>this.param).regex)]);
          break;
       
      }
  

  }



  /**
   * changes the view and updates the tree with the new value
   * @param value 
   */
  onParamChange(value: number){

    const opnode: OpNode = <OpNode> this.tree.getNode(this.opid);

    switch(this.param.type){
      case 'number': 
        opnode.params[this.paramid] = value;
        this.fc.setValue(value);
        break;

      case 'boolean':
        opnode.params[this.paramid] = (value) ? 1 : 0;
        this.fc.setValue(value);
        break;

      case 'string':
        console.log("value", value)
        opnode.params[this.paramid] = value;
        this.fc.setValue(value);
        break;

      case 'select':
        opnode.params[this.paramid] = value;
        this.fc.setValue(value);
        break;
    }

    this.onOperationParamChange.emit({id: this.paramid});
   
  }

  handleFile(obj: any){
    this.fc.setValue(obj.data.name);
    this.opnode.params[this.paramid] = obj.id;
    this.onFileUpload.emit({id: obj.id, data: obj.data});
  }


}
