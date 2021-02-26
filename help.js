function wimg(t) {
    return t+' (<div class=helpimg style="background-image:'+url(t)+';"></div>)';
}

function bar(v,m) {
    let p = 100 * v / m;
    v = v.toFixed(1);
    return `<div style="text-align: center; background:linear-gradient(to right, cyan 0%, cyan ${p}%, transparent ${p+5}%);width:5em;">${v}</div>`;
}

function tower([n,{range, damage, reloadTime, desc}]) {
return `
<tr>
  <td style="white-space:nowrap">${wimg(n)}</td>
  <td>${bar(damage/reloadTime,2)}</td>
  <td>${bar(range,6)}</td>
  <td>${desc}</td>
</tr>
`;
}

const towerHelp = Object.entries(towerStats).map(tower).join(' ');

const help = `
<div>
  <div>
    <h4>Basics</h4>
    Enemies emerge from each ${wimg('evilcity')} and try to destroy
    your ${wimg('city')} or cities.  Kill them first by building
    towers.  Towers cost money, which you get by killing enemies (you
    start with a little).  Enemies cannot go through towers, but you
    must leave a path they can use (if you somehow manage to deny them
    a path, they will gain the ability to burrow through obstacles).
    <h4>Towers</h4>
    <table>
      <tr>Tower<th><th>DPS</th><th>Range</th><th>Notes</th></tr>
      ${towerHelp}
    </table>
    <h4>Enemies</h4>
    <ul>
      <li> ${wimg('warriors')}: slow moving
      <li> ${wimg('horsemen')}: fast
      <li> ${wimg('chariot')}: even faster, but slow to change
        direction
    </ul>
    Any unit can also exist in extra-large form, with 3x the HP.
    <h4>Terrain</h4>
    <ul>
      <li> ${wimg('plains')}: the baseline against which all others
        are measured
      <li> ${wimg('swamp')}: cannot have towers, enemies move slowly
      <li> ${wimg('jungle')}: cannot have towers or enemies, but can
      be targetted and destroyed by cannons or artillery (leaving
        plains)
      <li> ${wimg('hills')}: blocks enemies; towers have bonus range
      <li> ${wimg('mountains')}: blocks enemies and towers
    </ul>
    <h4>Actions</h4>
    <ul>
      <li> Build Tower: Click on the map, then pick a tower type
      <li> ${wimg('upgrade')}: Click on a tower and select upgrade.
        Increases range 10% and damage 50%.
      <li> ${wimg('sell')}: Click on a tower and select sell to remove
        the tower from the board and recover half of its build cost
      <li> Change Targetting Policy: Click a tower and click its
        policy to change to the next one.  Note that what is shown is
        the <i>current</i> policy. <ul>
          <li> ${wimg('first')}: Target the enemy closest to its
            detination
          <li> ${wimg('biggest')}: Target the enemy with the most HP
          <li> ${wimg('clump')}: Target the enemy closest to other
            enemies
          <li> ${wimg('last')}: Target the enemy furthest from its
            destination
        </ul>
      <li> Manual Target: Click on an enemy or a jungle tile.  All
        towers within range will target that, ignoring their policy.
    </ul>
    <h4>The Title Bar</h4>
    The pieces of the title bar are:
    <ul>
      <li>How much money you have
      <li>Speed control, from "paused" to "very fast".  All
        game-relevant things change speed together.
      <li>How many hits you can take before defeat
      <li>What fraction of the enemies who will be generated have been
      <li>How much tougher enemies created now are than when they
        started
      <li>The symbols this map is based on, in case you're wondering
      <li>Control arrows to show how enemies will move
      <li>Display this help
    </ul>
  </div>
  <input type=button value="Close" id="closehelp">
</div>
`;

function showHelp() {
    let elem = document.createElement('div');
    elem.innerHTML = help;
    elem.className = 'help';
    document.body.appendChild(elem);
    document.getElementById('closehelp').addEventListener('click', ()=>{ document.body.removeChild(elem); });
}

