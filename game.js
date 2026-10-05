const C=document.getElementById('c'),g=C.getContext('2d'),W=1000,H=800,CX=500,CY=400,R=370,TAU=Math.PI*2;
const KERNELS={
  shield:{c:'#e8a317',tip:'#f6d98a',edge:'#9a6a00',w:12,h:14,n:'Shield',d:'Bubble blocks and deflects hazards for 2s'},
  throw:{c:'#f08a24',tip:'#f9cf9a',edge:'#a24d00',w:10,h:15,n:'Catch & Throw',d:'Catch a hazard, aim with the mouse, throw with Space or click'},
  heal:{c:'#ffe27a',tip:'#fff6cf',edge:'#b8962e',w:11,h:13.5,n:'Heal',d:'Restore half a heart'}
};
const PHASES=[
  {n:'Butter',e:'🧈',t:25,c:'#f6d55c'},{n:'Salt',e:'🧂',t:25,c:'#ffffff'},
  {n:'Fire',e:'🔥',t:25,c:'#ff6a2b'},{n:'Microwave',e:'',t:30,c:'#7df9ff'}
];
const keys={};let S=null,last=0,mx=CX,my=CY,useMouse=false;

addEventListener('keydown',e=>{
  if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();
  keys[e.key]=true;
  if(e.key===' '&&S&&!S.over)act(S.k[0]);
});
addEventListener('keyup',e=>keys[e.key]=false);
C.addEventListener('mousemove',e=>{
  const r=C.getBoundingClientRect();
  mx=(e.clientX-r.left)*W/r.width;my=(e.clientY-r.top)*H/r.height;useMouse=true;
});
C.addEventListener('mousedown',()=>{if(S&&!S.over)act(S.k[0])});

const ui=document.getElementById('ui'),picks=document.getElementById('picks');
function menu(title,msg){
  document.getElementById('title').textContent=title;
  document.getElementById('msg').textContent=msg;
  picks.innerHTML='';
  for(const k in KERNELS){
    const b=document.createElement('button');
    b.innerHTML=KERNELS[k].n+'<small>'+KERNELS[k].d+'</small>';
    b.style.background=KERNELS[k].c;b.onclick=()=>start(k);
    picks.appendChild(b);
  }
  ui.classList.remove('hide');
}
menu("Popcorn: Don't Get Popped","You are a kernel in a round kitchen. Survive Butter, Salt, Fire and the Microwave in the middle. Arrow keys move, Space uses your ability. Pick a kernel:");

function kernel(type,isP){
  const a=Math.random()*TAU,r=90+Math.random()*(R-130);
  return{x:CX+Math.cos(a)*r,y:CY+Math.sin(a)*r,hp:2,type,isP,inv:0,cd:0,sh:0,cat:0,
    alive:true,tx:CX,ty:CY+150,held:null,holdT:0,dir:-Math.PI/2,aim:0,tilt:(Math.random()-.5)*.5,sz:.92+Math.random()*.16};
}
function start(type){
  const types=Object.keys(KERNELS);
  S={t:0,ph:0,pt:0,a1:0,a2:0,ang:0,pr:[],over:false,brk:3.5,msg:'Get ready!',pend:null,bx:CX,by:CY,tx:CX,ty:CY,mvT:0,moving:false,k:[kernel(type,true)]};
  for(let i=0;i<11;i++)S.k.push(kernel(types[i%3],false));
  ui.classList.add('hide');
  last=performance.now();requestAnimationFrame(loop);
}
function aimOf(k){return k.isP?(useMouse?Math.atan2(my-k.y,mx-k.x):k.dir):k.aim}
function act(k){
  if(k.type==='throw'&&k.held)throwIt(k);else useAbility(k);
}
function useAbility(k){
  if(k.cd>0||!k.alive)return;
  if(k.type==='shield'){k.sh=2;k.cd=5}
  else if(k.type==='throw'){k.cat=.7;k.cd=4}
  else{k.hp=Math.min(2,k.hp+.5);k.cd=6}
}
function throwIt(k){
  const q=k.held;if(!q)return;
  const a=aimOf(k);
  q.x=k.x+Math.cos(a)*24;q.y=k.y+Math.sin(a)*24;
  q.vx=Math.cos(a)*340;q.vy=Math.sin(a)*340;
  q.owner='r';q.from=k;q.held=null;q.col='#ffb703';
  k.held=null;k.holdT=0;
}
function fire(a,sp,r,col,dmg){
  S.pr.push({x:S.bx+Math.cos(a)*40,y:S.by+Math.sin(a)*40,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r,col,dmg,owner:'boss',from:null,held:null});
}
function spawn(dt){
  S.a1+=dt;S.a2+=dt;const ph=S.ph,p=S.k[0];
  if(ph===0){
    if(S.a1>.5){S.a1=0;S.ang+=.6;for(let i=0;i<3;i++)fire(S.ang+i*TAU/3,140,8,'#f6d55c',.5)}
    if(S.a2>3.6){S.a2=0;for(let i=0;i<8;i++)fire(S.ang+i*TAU/8,100,10,'#ffe58a',.5)}
  }else if(ph===1){
    if(S.a1>.32){S.a1=0;fire(Math.random()*TAU,190+Math.random()*60,4,'#fff',.5)}
  }else if(ph===2){
    if(!S.pend&&S.a2>3.2)S.pend={t:.9,gap:Math.random()*TAU};
    if(S.pend){
      S.pend.t-=dt;
      if(S.pend.t<=0){
        for(let i=0;i<24;i++){
          const a=i/24*TAU,d=((a-S.pend.gap)%TAU+TAU)%TAU;
          if(d>.35&&d<TAU-.35)fire(a,80,14,'#ff6a2b',1);
        }
        S.pend=null;S.a2=0;
      }
    }
  }else{
    if(S.a1>.45){S.a1=0;S.ang+=.5;for(let i=0;i<4;i++)fire(S.ang+i*TAU/4,160,5,'#7df9ff',.5)}
    if(S.a2>3.5){S.a2=0;const a=Math.atan2(p.y-S.by,p.x-S.bx);for(let i=-1;i<=1;i++)fire(a+i*.2,220,6,'#c8fbff',.5)}
  }
}
function mv(k,vx,vy,sp){
  let x=k.x+vx*sp,y=k.y+vy*sp;
  const dx=x-CX,dy=y-CY,d=Math.hypot(dx,dy)||1;
  if(d>R-14){x=CX+dx/d*(R-14);y=CY+dy/d*(R-14)}
  const bx=x-S.bx,by=y-S.by,bd=Math.hypot(bx,by)||1;
  if(bd<75){x=S.bx+bx/bd*75;y=S.by+by/bd*75}
  k.x=x;k.y=y;
}
function bot(b,dt){
  let th=null,md=95;
  for(const p of S.pr){
    if(p.from===b||p.held)continue;
    const d=Math.hypot(p.x-b.x,p.y-b.y);
    if(d<md){md=d;th=p}
  }
  let vx,vy;
  if(th){
    vx=b.x-th.x;vy=b.y-th.y;
    if(md<55&&Math.random()<.2)useAbility(b);
  }else{
    if(Math.hypot(b.tx-b.x,b.ty-b.y)<10||Math.random()<.005){
      const a=Math.random()*TAU,r=80+Math.random()*(R-110);b.tx=CX+Math.cos(a)*r;b.ty=CY+Math.sin(a)*r;
    }
    vx=(b.tx-b.x)*.5;vy=(b.ty-b.y)*.5;
  }
  const l=Math.hypot(vx,vy)||1;
  mv(b,vx/l,vy/l,140*dt);
}
function clearField(){
  S.pr=[];S.pend=null;
  for(const k of S.k){k.held=null;k.holdT=0;k.cat=0}
}
function moveBoss(dt){
  if(S.ph!==0)return;
  S.mvT+=dt;
  if(!S.moving&&S.mvT>=10){
    S.mvT=0;S.moving=true;
    const a=Math.random()*TAU,rr=60+Math.random()*160;
    S.tx=CX+Math.cos(a)*rr;S.ty=CY+Math.sin(a)*rr;
  }
  if(S.moving){
    const dx=S.tx-S.bx,dy=S.ty-S.by,d=Math.hypot(dx,dy);
    if(d<3)S.moving=false;
    else{S.bx+=dx/d*45*dt;S.by+=dy/d*45*dt}
  }
}
function update(dt){
  S.t+=dt;
  if(S.brk>0){S.brk-=dt;if(S.brk<=0){S.brk=0;S.a1=S.a2=0}}
  else{
    S.pt+=dt;
    if(S.pt>=PHASES[S.ph].t){
      S.ph++;S.pt=0;clearField();S.bx=CX;S.by=CY;S.mvT=0;S.moving=false;
      if(S.ph>=4)return finish(true);
      for(const k of S.k)if(k.alive)k.hp=2;
      S.brk=4;S.msg='Phase cleared! Hearts restored.';
    }else{moveBoss(dt);spawn(dt)}
  }
  const p=S.k[0];
  const dx=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0),dy=(keys.ArrowDown?1:0)-(keys.ArrowUp?1:0);
  const l=Math.hypot(dx,dy)||1;
  if(dx||dy){p.dir=Math.atan2(dy,dx);}
  if(p.alive)mv(p,dx/l,dy/l,230*dt);
  for(const k of S.k){
    if(!k.alive)continue;
    if(!k.isP)bot(k,dt);
    k.inv=Math.max(0,k.inv-dt);k.cd=Math.max(0,k.cd-dt);
    k.sh=Math.max(0,k.sh-dt);k.cat=Math.max(0,k.cat-dt);
    if(k.held){
      k.holdT+=dt;
      if(!k.isP&&k.holdT>.7){
        const foes=S.k.filter(o=>o!==k&&o.alive);
        if(foes.length){const t=foes[Math.floor(Math.random()*foes.length)];k.aim=Math.atan2(t.y-k.y,t.x-k.x)}
        throwIt(k);
      }else if(k.holdT>4)throwIt(k);
      else{const a=aimOf(k);k.held.x=k.x+Math.cos(a)*24;k.held.y=k.y+Math.sin(a)*24}
    }
  }
  for(const q of S.pr)if(!q.held){q.x+=q.vx*dt;q.y+=q.vy*dt}
  for(const q of S.pr){
    if(q.held)continue;
    for(const k of S.k){
      if(!k.alive||q.dead||q.from===k)continue;
      const d=Math.hypot(q.x-k.x,q.y-k.y);
      if(k.cat>0&&!k.held&&d<q.r+28){
        q.held=k;k.held=q;k.holdT=0;k.cat=0;q.vx=q.vy=0;q.owner='r';q.from=k;
      }else if(k.sh>0&&d<q.r+32){
        const a=Math.atan2(q.y-k.y,q.x-k.x);
        q.vx=Math.cos(a)*230;q.vy=Math.sin(a)*230;q.owner='r';q.from=k;
      }else if(d<q.r+10&&k.inv<=0){
        k.hp-=q.dmg;k.inv=.8;q.dead=true;
        if(k.hp<=0){
          k.alive=false;
          if(k.held){k.held.dead=true;k.held=null}
          if(k.isP)return finish(false);
        }
      }
    }
  }
  S.pr=S.pr.filter(q=>!q.dead&&(q.held||Math.hypot(q.x-CX,q.y-CY)<R+30));
  if(S.k.slice(1).every(k=>!k.alive))finish(true);
}
function finish(win){
  S.over=true;
  menu(win?'You stayed a kernel!':'You got popped! 🍿',
    win?'You survived the kitchen. Play again with any kernel:':'Reached '+PHASES[Math.min(S.ph,3)].n+' phase. Try again:');
}
function hearts(x,y,hp,sz){
  g.font=sz+'px serif';g.textAlign='left';
  for(let i=0;i<2;i++){
    const f=Math.max(0,Math.min(1,hp-i)),hx=x+i*sz*1.05;
    g.fillStyle='#55606e';g.fillText('\u2665',hx,y);
    if(f>0){g.save();g.beginPath();g.rect(hx,y-sz,sz*1.05*(f>=1?1:.5),sz*1.2);g.clip();
      g.fillStyle='#e63946';g.fillText('\u2665',hx,y);g.restore()}
  }
}
function kernelPath(w,h){
  g.beginPath();g.moveTo(0,h);
  g.bezierCurveTo(-w*.35,h*.55,-w,h*.1,-w,-h*.35);
  g.bezierCurveTo(-w,-h*.85,-w*.45,-h,0,-h*.9);
  g.bezierCurveTo(w*.45,-h,w,-h*.85,w,-h*.35);
  g.bezierCurveTo(w,h*.1,w*.35,h*.55,0,h);
  g.closePath();
}
function rr(x,y,w,h,c){g.beginPath();if(g.roundRect)g.roundRect(x,y,w,h,c);else g.rect(x,y,w,h)}
function drawMicrowave(x,y){
  const glow=.35+Math.sin(S.t*6)*.15;
  g.fillStyle='#c9ced6';rr(x-62,y-44,124,88,9);g.fill();
  g.strokeStyle='#7b8491';g.lineWidth=2;g.stroke();
  g.fillStyle='#1c2733';rr(x-54,y-36,74,72,6);g.fill();
  g.fillStyle='rgba(255,214,102,'+glow+')';rr(x-48,y-30,62,60,5);g.fill();
  g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(x-17,y+14,22,5,0,0,TAU);g.fill();
  g.fillStyle='#aab1bb';rr(x+26,y-36,28,72,4);g.fill();
  g.fillStyle='#0b1a12';rr(x+30,y-31,20,11,2);g.fill();
  g.fillStyle='#7dff9c';g.font='9px monospace';g.textAlign='center';g.fillText('0:30',x+40,y-22);
  g.fillStyle='#5b6470';
  for(let i=0;i<4;i++){g.beginPath();g.arc(x+34+(i%2)*12,y-4+Math.floor(i/2)*14,4,0,TAU);g.fill()}
  g.fillStyle='#e63946';g.beginPath();g.arc(x+40,y+28,4.5,0,TAU);g.fill();
  g.fillStyle='#7b8491';g.fillRect(x+21,y-20,3,40);
}
function draw(){
  const ph=PHASES[Math.min(S.ph,3)];
  g.fillStyle='#18212c';g.fillRect(0,0,W,H);
  g.fillStyle='#2b3b50';g.beginPath();g.arc(CX,CY,R,0,TAU);g.fill();
  g.strokeStyle=ph.c;g.lineWidth=4;g.stroke();
  if(S.pend){
    g.strokeStyle='rgba(255,106,43,.6)';g.lineWidth=6;g.beginPath();
    g.moveTo(CX+Math.cos(S.pend.gap)*40,CY+Math.sin(S.pend.gap)*40);
    g.lineTo(CX+Math.cos(S.pend.gap)*R,CY+Math.sin(S.pend.gap)*R);g.stroke();
  }
  g.globalAlpha=S.brk>0?.5:1;
  g.font='72px serif';g.textAlign='center';g.fillStyle='#fff';
  if(ph.n==='Microwave')drawMicrowave(S.bx,S.by);
  else g.fillText(ph.e,S.bx+(S.moving?Math.sin(S.t*8)*3:0),S.by+26);
  g.globalAlpha=1;
  g.font='16px Georgia';g.fillStyle='#f5efe0';g.textAlign='left';
  g.fillText(S.brk>0?'Break':ph.n+' phase  '+Math.ceil(PHASES[S.ph].t-S.pt)+'s',12,24);
  g.textAlign='right';g.fillText('Kernels left: '+S.k.filter(k=>k.alive).length+'/12',W-12,24);
  for(const q of S.pr){g.fillStyle=q.col;g.beginPath();g.arc(q.x,q.y,q.r,0,TAU);g.fill()}
  for(const k of S.k){
    if(!k.alive){g.font='16px serif';g.textAlign='center';g.fillText('🍿',k.x,k.y);continue}
    g.globalAlpha=k.inv>0&&Math.floor(S.t*20)%2?.4:1;
    const kv=KERNELS[k.type];
    g.save();g.translate(k.x,k.y);g.rotate(k.tilt);g.scale(k.sz,k.sz);
    kernelPath(kv.w,kv.h);
    if(k.isP){g.strokeStyle='#fff';g.lineWidth=5;g.stroke()}
    g.fillStyle=kv.c;g.fill();
    g.save();g.clip();
    g.fillStyle=kv.tip;g.fillRect(-kv.w,kv.h*.45,kv.w*2,kv.h);
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-kv.w*.45,-kv.h*.5,kv.w*.22,kv.h*.16,-.5,0,TAU);g.fill();
    g.restore();
    g.strokeStyle=kv.edge;g.lineWidth=1.3;kernelPath(kv.w,kv.h);g.stroke();
    g.beginPath();g.moveTo(-3,-kv.h*.8);g.quadraticCurveTo(0,-kv.h*.7,3,-kv.h*.8);g.stroke();
    g.fillStyle='#fff';
    g.beginPath();g.arc(-4,-4,3,0,TAU);g.arc(4,-4,3,0,TAU);g.fill();
    g.fillStyle='#222';
    g.beginPath();g.arc(-4,-4,1.4,0,TAU);g.arc(4,-4,1.4,0,TAU);g.fill();
    g.strokeStyle='#222';g.lineWidth=1.5;g.beginPath();
    if(k.inv>0)g.arc(0,4,2,0,TAU);else g.arc(0,1,4,.2,Math.PI-.2);
    g.stroke();
    g.restore();
    g.globalAlpha=1;
    if(k.sh>0){g.strokeStyle='#7df9ff';g.lineWidth=2;g.beginPath();g.arc(k.x,k.y,32,0,TAU);g.stroke()}
    if(k.cat>0){g.strokeStyle='#ffb703';g.lineWidth=2;g.beginPath();g.arc(k.x,k.y,28,0,TAU);g.stroke()}
    hearts(k.x-9,k.y-20,k.hp,12);
    if(k.isP){g.fillStyle='#fff';g.beginPath();g.moveTo(k.x-5,k.y-40);g.lineTo(k.x+5,k.y-40);g.lineTo(k.x,k.y-33);g.fill()}
  }
  const p=S.k[0];
  if(p.held){
    const a=aimOf(p);
    g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;g.setLineDash([6,6]);g.beginPath();
    g.moveTo(p.x,p.y);g.lineTo(p.x+Math.cos(a)*110,p.y+Math.sin(a)*110);g.stroke();g.setLineDash([]);
  }
  if(S.brk>0){
    g.fillStyle='#f5efe0';g.textAlign='center';
    g.font='30px Georgia';g.fillText(S.msg,CX,CY-90);
    g.font='18px Georgia';g.fillText('Next: '+PHASES[S.ph].n+' in '+Math.ceil(S.brk),CX,CY-62);
  }
  g.fillStyle='#f5efe0';g.textAlign='left';g.font='16px Georgia';
  g.fillText(KERNELS[p.type].n+': '+(p.held?'aim and press Space to throw':p.cd>0?'recharging '+p.cd.toFixed(1)+'s':'ready (Space)'),12,H-10);
  hearts(W-62,H-12,p.hp,26);
}
function loop(t){
  if(!S||S.over)return;
  const dt=Math.min(.05,(t-last)/1000);last=t;
  update(dt);
  if(!S.over)draw();
  requestAnimationFrame(loop);
}
