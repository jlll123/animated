// wechat:Liesle1
let userMoveTimer;
document.querySelector('main').addEventListener('mousemove', () => {
  document.body.classList.remove('noMove');
  clearTimeout(userMoveTimer);
  userMoveTimer = setTimeout(() => document.body.classList.add('noMove'), 1000);
});
document.querySelector('nav').addEventListener('mouseover', () => {
  clearTimeout(userMoveTimer);
});
userMoveTimer = setTimeout(() => document.body.classList.add('noMove'), 1000);