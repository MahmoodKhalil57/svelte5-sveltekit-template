const makeServerTimeRune = () => {
  let serverTimeRune = $state<number | undefined>(undefined);
  return {
    get value() {
      return serverTimeRune;
    },
    set: (newState: number | undefined) => {
      serverTimeRune = newState;
    }
  }
}

export let serverTimeRune = makeServerTimeRune();
