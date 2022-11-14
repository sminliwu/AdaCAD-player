import { Injectable} from '@angular/core';
import { wefts } from '../core/model/drafts';
import { Draft } from '../core/model/datatypes';
import { BaseOp as Op, BuildableOperation as GenericOp, 
  TreeOperation as TreeOp,
  Seed, Pipe, DraftsOptional, AllRequired, getDefaultParams,
  SingleInlet, OpInput
} from '../mixer/model/operation';
import * as defs from '../mixer/model/op_definitions';
import { PlayerOp, playerOpFrom, 
  ChainOp, OpSequencer, PairedOp, PedalOpMapping,
  makePairedOp, makeChainOp, makeOpSequencer,
  forward, refresh, reverse
} from './model/player_ops';
import { PlayerState, WeavingPick, copyState, initState } from './model/player';
import { EventEmitter } from 'events';
import { PedalsService, PedalStatus, Pedal } from './provider/pedals.service';
import { SequencerService } from './provider/sequencer.service';
// import { OperationService } from '../mixer/provider/operation.service';

export interface DraftOperationClassification {
  category: string,
  dx: string,
  ops: Array<PlayerOp> 
 }

interface LoomConfig {
  warps: number,
  draftTiling: boolean
}

/**
 * @class PedalConfig
 * @desc OLD, UPDATE THIS ---> 
 * Represents a set of two-way bindings between a set of Pedals
 * and a set of (Player)Operations. A pedal can only be bound to one
 * Action (a single Op, a chain of Ops, or to control an OpRoulette)
 * @todo The second restriction may change, it might make sense for pedals to
 * get bound to a sequence of operations.
 */
class PedalConfig {
  // numPedals: number;
  pedals: Array<Pedal>;
  ops: Array<PlayerOp>;
  availPedals: Array<number>;
  mapping: PedalOpMapping;  // pedal ID (number) <-> op (PlayerOp)

  constructor(pedalArray: Array<Pedal>, loadConfig = false) {
    this.pedals = pedalArray;
    this.ops = []
    this.availPedals = pedalArray.map((p) => p.id);
    this.mapping = [];
  }

  get numPedals() {
    return this.pedals.length;
  }

  get numMappings() {
    return Object.entries(this.mapping).length;
  }

  addPedal(p: Pedal) {
    // this.pedals.push(p);
    this.availPedals.push(p.id);
  }

  remPedal() {
    // this.pedals.pop();
    this.availPedals.filter((id) => id != this.pedals.length);
  }

  addOperation(o: PlayerOp, chain?: boolean) {
    o.id = this.ops.length;
    this.ops.push(o);
    if (chain) {
      o.chain = chain;
    }
    // this.unpairedOps.push(o);
    // console.log(this.ops);
  }

  pair(pedalId: number, opName: string) {
    let o = this.ops.findIndex((op) => op.name == opName);
    // let thisOp = this.unpairedOps.splice(o, 1);
    let thisOp = this.ops;
    this.mapping[pedalId] = makePairedOp(pedalId, thisOp[o]); 
  }

  chain(pedalId: number, opName: string) {
    let o = this.ops[this.ops.findIndex((op) => op.name == opName)];
    if (this.pedalIsChained(pedalId)) {
      let curr_ops = (<ChainOp> this.mapping[pedalId]).ops;
      this.mapping[pedalId] = makeChainOp(curr_ops.concat([o]), pedalId);
    } else if (this.pedalIsPaired(pedalId)) {
      let first_op = (<PairedOp> this.mapping[pedalId]).op;
      this.mapping[pedalId] = makeChainOp([first_op].concat([o]), pedalId);
    } else {
      this.mapping[pedalId] = makeChainOp([o], pedalId);
    }
  }

  chainToPedal(pedalId: number, ops: Array<string>) {
    let op_array = ops.map((name) => this.ops[this.ops.findIndex((op) => op.name == name)]);
    if (this.pedalIsChained(pedalId)) { 
      // if pedal already has a chain, add ops to the chain
      let curr_ops = (<ChainOp> this.mapping[pedalId]).ops;
      this.mapping[pedalId] = makeChainOp(curr_ops.concat(op_array), pedalId);
    } else if (this.pedalIsPaired(pedalId)) {
      // if pedal is paired, you can turn it into a chain
      let first_op = (<PairedOp> this.mapping[pedalId]).op;
      this.mapping[pedalId] = makeChainOp([first_op].concat(op_array), pedalId);
    } else {
      // pedal doesn't have anything mapped, just add a new chain
      this.mapping[pedalId] = makeChainOp(op_array, pedalId);
    }
  }

  // will return true if an op is mapped to a pedal in any way
  opIsMapped(opName: string): boolean {
    if (this.mapping.filter((m) => m.name.includes(opName)).length > 0) {
      return true;
    } else return false;
  }

  pedalIsMapped(id: number) {
    return (this.mapping[id]);
  }

  pedalIsChained(id: number) {
    if (this.pedalIsMapped(id) && this.mapping[id].name.startsWith('ch')) { return true; }
    else {return false; }
  }

  pedalIsPaired(id: number) {
    return (this.pedalIsMapped(id) && !this.pedalIsChained(id));
  }

  unpairPedal(id: number) {
    console.log(`unpairing pedal ${id}`);
    // let op = this.pairs[id];
    // this.unpairedOps.splice(op.id, 0, op);
    delete this.mapping[id];
  }

  // unpairOp(name: string) {
  //   let pid = this.opIsPaired(name);
  //   this.unpairPedal(pid);
  // }
}

/**
 * The Draft Player Service is in charge of updating the the global PlayerState and tracking where the weaver is in the draft.
 */
@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  state: PlayerState;
  loom: LoomConfig;
  pedals: PedalConfig;
  redraw = new EventEmitter();
  draftClassification: Array<DraftOperationClassification> = [];

  constructor(
    public pds: PedalsService,
    public seq: SequencerService,
    // private oss: OperationService
  ) {
    // this.draft = null; 
    console.log("draft player constructor");
    // const startPattern = playerOpFrom(defs.tabby);
    // console.log(startPattern);
    // startPattern.perform(nullOpInput).then((result) => {
    //   console.log(result);
    //   this.setDraft(result[0]);
    // });

    this.state = initState();
    this.state.draft = defs.tabby.perform([1]);

    this.loom = { warps: 2640, draftTiling: true };

    this.pedals = new PedalConfig(this.pds.pedals);

    // load the draft progress ops
    this.pedals.addOperation(forward);
    this.pedals.addOperation(refresh);
    this.pedals.addOperation(reverse);

    const ops = this.pedals;

    function addOp(op: GenericOp) {
      let p_op = playerOpFrom(op);
      ops.addOperation(p_op);
      return p_op;
    }

    // load ops from the main mixer
    const tabby = addOp(defs.tabby);
    const twill = addOp(defs.twill);
    const satin = addOp(defs.satin);
    const waffle = addOp(defs.waffle);
    const random = addOp(defs.random);
    const rotate = addOp(defs.rotate);
    const invert = addOp(defs.invert);
    const shiftx = addOp(defs.shiftx);
    const shifty = addOp(defs.shifty);
    const slope = addOp(defs.slope);
    const flipx = addOp(defs.flipx);
    const flipy = addOp(defs.flipy);
    const symm = addOp(defs.makesymmetric);
    const stretch = addOp(defs.stretch);

    this.draftClassification.push(
      {category: 'structure',
      dx: "0-1 input, 1 output, algorithmically generates weave structures based on parameters",
      ops: [tabby, twill, satin, waffle, random]}
    );

    this.draftClassification.push(
      {category: 'transformation',
      dx: "1 input, 1 output, applies an operation to the input that transforms it in some way",
      ops: [invert, flipx, flipy, shiftx, shifty, rotate, slope, stretch, symm]}
    );

    // //test this
    // console.log(this.oss.getOp('germanify'));
    // const germanify = this.pedalOps.addOperation(playerOpFromTree(<PlayableTreeOp> this.oss.getOp('germanify')));
    
    
    // this.pedalOps.addOperation(rotate) 
    // this.pedalOps.addOperation(tabby);
    // this.pedalOps.addOperation(twill);
    // this.pedalOps.addOperation(random);
    // this.pedalOps.addOperation(invert); 
    // this.pedalOps.addOperation(shiftx); 
    // this.pedalOps.addOperation(flipx);
    // this.pedalOps.addOperation(slope); 
    // this.pedalOps.addOperation(stretch);

    // this.pds.pedal_array.on('pedal-added', (num) => {
    //   // console.log("automatically pairing first pedal", num);
    //   if (num == 1) {
    //     console.log(this.pedalOps);
    //     this.setPedalOp({value: 'forward'}, this.pedals[0]);
    //   }
    // });
    console.log('pedal ops added');

    this.pds.on('pedal-step', (id) => this.onPedal(id));

    this.pds.on('pedal-added', (n) => {
      if (n == 1) {
        this.pedals.pair(0, 'forward');
        console.log("pedals mapping", this.pedals.mapping);
      } else if (n == 2) {
        if (this.pedals.pedalIsMapped(0)) this.pedals.unpairPedal(0);
        this.pedals.mapping[0] = makeOpSequencer(0, 1);
        this.pedals.mapping[1] = this.pedals.mapping[0];
        this.seq.start(0, 1);
        console.log("pedals mapping", this.pedals.mapping);
      }
    })
  }

  get readyToWeave() {  // need either one pedal forward or one pedal reverse, in order to progress through draft
    return (this.pds.readyToWeave && 
      (this.pedals.opIsMapped('forward') || this.pedals.opIsMapped('reverse'))
    );
  }
  get weaving() {
    return this.pds.active_draft.val;
  }
  get draft() {
    return this.state.draft;
  }

  setDraft(d: Draft) {
    this.state.draft = d;
    this.state.row = 0;
    // console.log("player has active draft");
    // console.log("draft is ", this.draft);
    console.log("state is ", this.state);
  }

  // e is a string = op.name
  setPedalOp(e: any, p: Pedal) {
    console.log(e, p);
    if (this.pedals.pedalIsPaired(p.id)) {
      this.pedals.unpairPedal(p.id);
    }
    this.pedals.pair(p.id, e);
    console.log("pedals dict", this.pedals.mapping);
  }

  onPedal(id: number) {
    console.log('pedal ', id);
    if (this.pedals.mapping[id]) {
      console.log('mapping exists for pedal');
      this.pedals.mapping[id].perform(this.state, id)
      .then((state: PlayerState) => {
        this.state = state;
        console.log(this.state);
        this.redraw.emit('redraw');
        if (this.state.weaving) {
          // this.pds.loom_ready.once('change', (state) => {
          //   if (state) {
              console.log("draft player: sending row");
              this.pds.sendDraftRow(this.currentRow());
            // }
          // })
        }
      });
    }
  }

  // compound pedal operations
  // normal pedal -> op
  // compound pedal -> Op sequence
  // if (compound pedal change) {
      // sequence of operations: [Op, Op, Op]
      // let finaldraft = starting Draft;
      // for op in sequence:
      //   finaldraft = finaldraft.perform(op);
      // }
      // do something with finaldraft
  // }


  currentRow() {
    let {draft, row} = this.state;
    let draftRow = draft.drawdown[row % wefts(draft.drawdown)];
    let data = "";

    let targetLength = (this.loom.draftTiling ? this.loom.warps : draftRow.length);
    while (data.length < targetLength) {
      for (var i in draftRow) {
        if (draftRow[i].is_up) {
          data += '1';
        } else {
          data += '0';
        }
      }
    }
    let pick: WeavingPick = { pickNum: row, rowData: data };
    return pick;
  }

  toggleDraftTiling(e) {
    // console.log("toggle ", e);
    this.loom.draftTiling = e.checked;
    // console.log("draft tiling ", this.loom.draftTiling);
  }

  changeLoomWidth(e) {
    // console.log(e.target.value);
    this.loom.warps = e.target.value;
    // console.log("warps", this.loom.warps);
  }

  toggleWeaving() {
    // don't let user start weaving until AT LEAST:
    // - 1 pedal connected AND
    // - 1 pedal configured with operation "forward" or "reverse"
    this.pds.toggleWeaving();
    this.pds.sendDraftRow(this.currentRow());
    // this.pds.vacuum_on.once('change', (state) => {
    //   if (state) {
    //   }
    // });
  }
}
