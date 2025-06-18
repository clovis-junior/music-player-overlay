export function AddZero(number = 0) {
  number = number.toString();
  
  return (number.length < 2) ? `0${number.toString()}` : number
}

export function IsEmpty(variable) {
  return (typeof variable === 'undefined' || variable === null || (typeof variable === 'string' && variable.length <= 0))
}

export function URLValidade(value) {
  let filter=/^(https?):\/\/(?:www\.)?([a-zA-Z0-9-]{1,256})\.([a-zA-Z0-9.]{2,})\b([a-zA-Z0-9-_()@:%+.~#?&//=]*)$/is;
  return (filter.test(value)) ? true : false;
}
  
export function ConvertTime(time = 0) {
  const minutes = Math.floor(time / 60),
    seconds = Math.floor(time % 60);
  
  return `${AddZero(minutes)}:${AddZero(seconds)}`
}

export function GetURLParams(path) {
  path = path || window.location.href;
  path = path.split('?')[1];

  const search = path?.split('&'), params = {};

  params.get = function (param) {
    return params[param]
  }

  params.has = function (param) {
    return (param in params)
  }

  search?.forEach(param => params[param.split('=')[0]] = param.split('=')[1]);

  return params
}