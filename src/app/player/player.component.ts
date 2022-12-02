import { Component, Input, Output, OnInit, ViewChild, EventEmitter} from '@angular/core';
import { PlayerService } from './player.service';

import { OpSequencerComponent } from './op-sequencer/op-sequencer.component';
import { WeavingStateComponent } from './weaving-state/weaving-state.component';

import { Draft } from '../core/model/datatypes';
import { wefts, warps, isUp, isSet } from '../core/model/drafts';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @ViewChild(WeavingStateComponent) weaving_state;
  @ViewChild(OpSequencerComponent) op_sequencer;

  @Input()  default_cell: number;
  @Input('draft') active_draft: Draft;

  @Output('player-open') playerOpen = new EventEmitter<boolean>();
  // @Input() 
  // get draft_set(): boolean {
  //   return (this.pls.draft !== null);
  // };

  // get pls.draft(): Draft { return this._active_draft; }
  // set pls.draft(value: Draft) {
  //   this._active_draft = value;
  // }
  // private _active_draft: Draft = null;

  open: boolean = true;
  ownContainer: HTMLElement;
  mixerContainer: HTMLElement;
  
  constructor(
    public pls: PlayerService
  ) { 

  }

  ngOnInit(): void {
    // console.log("ng on init, pedals: ", this.pls.pedals);
    /** FOR TESTING ONLY: generate random draft and set it at start-up */
  }

  ngAfterViewInit() {
    console.log("ng after view init, pedals: ", this.pls.pedals);
    // const startPattern = this.oss.getOp('tabby');
    // startPattern.perform([]).then((result) => {
    //   this.pls.setDraft(result[0]);
    //   this.drawDraft();
    // });
    this.ownContainer = document.querySelector("#player-container > .mat-expansion-panel");
    this.mixerContainer = document.querySelector('app-mixer > mat-drawer-container');
    console.log("init w/ element refs ", this.ownContainer, this.mixerContainer);
    // this.draftCanvas = <HTMLCanvasElement> document.getElementById('active-draft-canvas');
    // this.cx = this.draftCanvas.getContext("2d");
    // this.drawDraft(); //force call here because it likely didn't render previously. 

    // let expansionPanel = document.querySelector('mat-expansion-panel');
    // expansionPanel.close();

    this.open = false;
    // this.resizeContainer();
    this.drawDraft();

    this.pls.redraw.on('redraw', () => {
      console.log("redrawing ", this.pls.state);
      // this.drawDraft();
      // this.resizeContainer();
    });

  }

  resizeContainer() {
    console.log("resizing");
    let t = document.querySelector("app-topbar").getBoundingClientRect().height;
    if (this.open) {
      this.mixerContainer.style.height = '0px';
      this.ownContainer.style.height = 'calc(100vh - ' + t.toString() + 'px)';
      this.ownContainer.style.overflow = "scroll";
    } else {
      let h = document.querySelector("mat-expansion-panel-header").getBoundingClientRect().height;
      this.mixerContainer.style.height = 'calc(100vh - '+ (h+t).toString() + 'px)';
      this.ownContainer.style.overflow = "unset";
    }
  }

  drawDraft() { this.weaving_state.drawDraft(); }

  toggleOpen(state: boolean) {
    console.log("toggling");
    this.open = state;
    // this.resizeContainer();
    this.playerOpen.emit(this.open);
  }
}
  
