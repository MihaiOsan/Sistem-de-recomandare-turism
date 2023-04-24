export class Attraction {
    constructor(
      public name: string,
      public rating: number,
      public description: string,
      public imageUrl?: string,
      public icon?: string
    ) {}
  }