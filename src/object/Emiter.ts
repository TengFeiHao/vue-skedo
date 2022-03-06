// 观察者和被观察者，可以被观察就可被订阅
import { Observable } from 'rxjs'

type ObserverFunction = (data: any) => void

export class Emiter<Topic extends string | number | symbol> {

  private observers: Map<Topic, ObserverFunction[]>
  constructor() {
    this.observers = new Map()
  }

  private addObserverFunction(topic: Topic, fn: ObserverFunction) {
    if(!this.observers.has(topic)) {
      this.observers.set(topic, [])
    }
    this.observers.get(topic)?.push(fn)
  }

  on(topic: Topic | Topic[]): Observable<any> {
    return new Observable<any>(observer => {
      if(Array.isArray(topic)) {
        topic.forEach(t => {
          this.addObserverFunction(t, (data) => {
            observer.next(data)
          })
        })
      }else {
        this.addObserverFunction(topic, (data) => {
          observer.next(data)
        })
      }
    })
  }

  emit(topic: Topic, data?: any) {
    this.observers.get(topic)?.forEach(fn => {
      fn(data)
    })
  }
}

// enum Topics {
//   A,
//   B,
//   C
// }

// const emitter = new Emiter<Topics>()

// emitter.on(Topics.A)
//   .subscribe((data) => {
//     console.log('a triggered', data)
//   })
// emitter.emit(Topics.A, 'Hello A')
  