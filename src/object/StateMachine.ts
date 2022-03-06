import { Emiter } from "./Emiter";

type StateTransferFunction = (...args: Array<any>) => void;

export class StateMachine<
  S extends string | number,
  A extends string | number,
  Topic extends string | number
> extends Emiter<Topic> {
  private state: S;
  // S -> A -> S  StateTransferFunction 理解成一个回调函数
  private transferTable: Map<S, Map<A, [StateTransferFunction, S]>>;
  constructor(initialState: S) {
    super();
    this.state = initialState;
    this.transferTable = new Map();
  }

  private addTransfer(from: S, to: S, action: A, fn: StateTransferFunction) {
    if (!this.transferTable.has(from)) {
      this.transferTable.set(from, new Map());
    }

    const adjTable = this.transferTable.get(from);
    adjTable?.set(action, [fn, to]);
  }
  // 注册，原状态 到 现在状态 触发那个 action， 回调函数
  public register(from: S | S[], to: S, action: A, fn: StateTransferFunction) {
    if (Array.isArray(from)) {
      from.forEach((s) => {
        this.addTransfer(s, to, action, fn);
      });
    } else {
      this.addTransfer(from, to, action, fn);
    }
  }

  public dispatch(action: A, ...data: Array<any>) {
    // Map<S, Map<A, [StateTransferFunction, S]>>
    // 根据当前状态 找到最外层Map里面的  里层Map
    const adjTable = this.transferTable.get(this.state);
    // 找到里层Map之后，看里层Map是否有此时 dispatch的action
    // 如果有执行StateTransferFunction 回调，改变当前的状态
    // 如果没有，return
    const transfer = adjTable?.get(action);
    if (!transfer) {
      return false;
    }
    const [fn, nextS] = transfer;

    fn(...data);
    this.state = nextS;

    // <auto> 状态机的自执行，方便状态自动回位
    while (this.dispatch("<auto>" as A, ...data)) 
    return true;
  }
}
