let log = function(...v: any[]) {
  ///  console.log.apply(this, v);
    //$('#status').text(v.join(','));
};

let error = function(...v: any[]) {
    console.error.apply(this, v);
    //$('#status').text(v.join(','));
};

export class Log{
    public static log(...v: any[]) {
      ///  console.log.apply(this, v);
        //$('#status').text(v.join(','));
    }
    public static debug(...v: any[]) {
      ///  console.log.apply(this, v);
        //$('#status').text(v.join(','));
    }
    public static error(...v: any[]) {
        console.error.apply(this, v);
        //$('#status').text(v.join(','));
    }
}

export {log, error}