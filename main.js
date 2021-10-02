const pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=pSBCr(c0),P=p<0,t=c1&&c1!="c"?pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

var all_children = []

function save_all_children() {
    all_children = [];
    pcs = document.getElementsByClassName("replyContainer");
    for (i = 0; i < pcs.length; i++) {
        all_children.push(pcs[i].cloneNode(true));
    }
}

function remove_all_replies() {
    thread = document.getElementsByClassName("thread")[0];
    while (thread.childNodes.length > 1) {
        thread.removeChild(thread.lastChild);
    }
}

function nest_replies() {
    pcs = document.getElementsByClassName("replyContainer");

    node_to_parent = {}
    parent_not_nested = {}

    for (i = 0; i < pcs.length; i++) {
        pc_id = pcs[i].id.substr(2)

        sarrow = document.getElementById("sa" + pc_id);
        sarrow.setAttribute("data-cmd", "hide-r");
        sarrow.setAttribute("data-id", pc_id);

        bls = pcs[i].getElementsByClassName("backlink");
        if (bls.length == 0)
            continue;
        spans = bls[0].getElementsByTagName("span");

        for (j = 0; j < spans.length; j++) {
            to_mv_id = spans[j].children[0].getAttribute("href").substr(2);
            to_mv_pc = document.getElementById("pc" + to_mv_id);
            to_mv_p = document.getElementById("p" + to_mv_id);
            where = document.getElementById("m" + pc_id);

            if (to_mv_id in node_to_parent) {
                parent = node_to_parent[to_mv_id];
                if (parent in parent_not_nested)
                    parent_not_nested[parent].push(to_mv_id);
                else
                    parent_not_nested[parent] = [to_mv_id];
            }

            node_to_parent[to_mv_id] = pc_id;
            where.appendChild(to_mv_pc);

            parent_color = window.getComputedStyle(document.getElementById("p" + pc_id), null).getPropertyValue("background-color");
            child_color = pSBC(0.25, parent_color, "c")

            to_mv_pc.style.backgroundColor = parent_color;
            to_mv_p.style.backgroundColor = child_color;
        }
    }

    for (const [key, value] of Object.entries(parent_not_nested)) {
      // console.log(key, value);
      pc = document.getElementById("pc" + key);
      bl = pc.getElementsByClassName("backlink")[0];
      not_nested = bl.children[0].cloneNode(true);
      not_nested.innerHTML = "  Not Nested: ";
      not_nested.style.fontSize = "small";
      bl.appendChild(not_nested)

      for (i = 0; i < value.length; i++) {
        new_id = value[i];
        add_id = bl.children[0].cloneNode(true);
        add_id.children[0].innerHTML = ">>" + new_id;
        add_id.children[0].setAttribute("href", "#p" + new_id);
        bl.appendChild(add_id)
      }
    }

    document.getElementById('toggle-view').setAttribute('next', '4chan');
}

function load_og_view() {
    remove_all_replies();
    thread = document.getElementsByClassName("thread")[0]
    for (i = 0; i < all_children.length; i++) {
        thread.appendChild(all_children[i].cloneNode(true));
    }
    document.getElementById('toggle-view').setAttribute('next', 'reddit');
}

function load_reddit_view() {
    save_all_children();
    nest_replies();
}

function setup_toggle(next) {
    console.log("setup_toggle called")
    opc = document.getElementsByClassName("opContainer")[0];
    post_info = opc.getElementsByClassName("postInfo")[0];
    sp = post_info.getElementsByClassName("nameBlock")[0];
    toggle = sp.cloneNode(true);
    post_info.insertBefore(toggle, sp);
    sp.innerHTML = '<button type="button" id="toggle-view" next="' + next + '">Toggle View</button>';
    // sp.innerHTML = '<button type="button" id="toggle-view">Toggle View</button>';
    document.getElementById('toggle-view').addEventListener('click', hello);
}

function hello() {
    toggle_btn = document.getElementById('toggle-view');
    next = toggle_btn.getAttribute("next");
    if (next == "4chan") {
        load_og_view();
        console.log("4chan");
    } else {
        load_reddit_view();
        console.log("reddit");
    }
}

setup_toggle('reddit');
load_reddit_view();