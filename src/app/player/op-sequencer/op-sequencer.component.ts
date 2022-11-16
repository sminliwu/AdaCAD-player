import { Component, OnInit } from '@angular/core';
import { PlayerService } from '../player.service';
import { PedalsService } from '../provider/pedals.service';
import { SequencerService } from '../provider/sequencer.service';

@Component({
  selector: 'app-op-sequencer',
  templateUrl: './op-sequencer.component.html',
  styleUrls: ['./op-sequencer.component.scss']
})
export class OpSequencerComponent implements OnInit {

  constructor(
    public pls: PlayerService,
    public pds: PedalsService,
    public seq: SequencerService
  ) { }

  ngOnInit(): void {
  }

}
