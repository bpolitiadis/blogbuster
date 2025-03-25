declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: import("mongoose").Mongoose | null;
    promise: Promise<import("mongoose").Mongoose> | null;
  };
}
