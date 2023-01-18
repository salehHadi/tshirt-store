class WhereClause {
  constructor(base, bigQ) {
    (this.base = base), (this.bigQ = bigq);
  }

  search() {
    const searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "i",
          },
        }
      : {};

    this.base = this.base.find(...searchword);

    return this;
  }

  pager() {
    let currentPage = 1;

    if (this.bigQ.page) {
      currentPage = this.bigQ.page;
    }
    const skipVal = this.bigQ.page * (currentPage - 1);
    this.base.limit(this.bigQ.page).skip(skipVal);
  }
}
