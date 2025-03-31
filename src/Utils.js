export function AddZero(number = 0) {
  number = number.toString();
  
  return (number.length < 2) ? `0${number.toString()}` : number
}

export function URLValidade(value) {
  let filter=/^(https?)\:\/\/(?:www\.)?([a-zA-Z0-9-]{1,256})\.([a-zA-Z0-9.]{2,})\b([a-zA-Z0-9-_()@:%\+.~#?&\/\/=]*)$/is;
  return (filter.test(value)) ? true : false;
}
  
export function ConvertTime(time = 0) {
  const minutes = Math.floor(time / 60),
    seconds = Math.floor(time % 60);
  
  return `${AddZero(minutes)}:${AddZero(seconds)}`
}
