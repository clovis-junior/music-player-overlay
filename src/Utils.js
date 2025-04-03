export function AddZero(number = 0) {
  number = number.toString();
  
  return (number.length < 2) ? `0${number.toString()}` : number
}

export function IsEmpty(variable) {
  return (typeof variable === 'undefined' || variable === null || (typeof variable === 'string' && variable.length <= 0))
}

export function GetURLParams() {
  const target = (window.location.search.length <= 1)
    ? window.location.hash.split('?')[1] : window.location.search.substring(1);

  const search = target.split('&'), params = {};

  params.get = function(param) {
    return params[param]
  }

  params.has = function(param) {
    return (param in params)
  }

  search.forEach(param => params[param.split('=')[0]] = param.split('=')[1]);

  return params
}

export function GenerateRandomString(length = 8, uppercase = true, numbers = true, special = false) {
  let output = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz';

  if(uppercase)
    characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  if(numbers) characters += '0123456789';
  if(special) characters += '!@#$%&*';

  for(let i=0;i<length;i++)
    output += characters.charAt(Math.floor(Math.random() * characters.length));

  return output;
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
