function toggleSidebar(){
  document.querySelector('.sidebar').classList.toggle('open');
}
document.addEventListener('click', function(e){
  const sb = document.querySelector('.sidebar');
  if(!sb) return;
  if(sb.classList.contains('open') && !sb.contains(e.target) && !e.target.closest('.nav-toggle')){
    sb.classList.remove('open');
  }
});
