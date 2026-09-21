import type { CSSProperties, PointerEvent } from 'react';
import type { WorldSelection } from '../app/ui-state';
import { BUILDING_SELECTIONS, getBuildingSelectionDefinition } from './building-selection-model';
interface Props { selection: WorldSelection; active: boolean; focusPulse: number; onSelect:(entityId:string)=>void; onClear:()=>void; }
export function BuildingSelectionLayer({selection,active,focusPulse,onSelect,onClear}:Props){
 if(!active) return null; const selectedId=selection?.kind==='building'?selection.entityId:null; const selected=getBuildingSelectionDefinition(selectedId);
 function clearFromWorld(event:PointerEvent<HTMLDivElement>){if(event.target===event.currentTarget&&selection) onClear();}
 return <div className="building-selection-world-layer" aria-label="可选择建筑区域" onPointerDown={clearFromWorld}>
 {BUILDING_SELECTIONS.map((building)=>{const isSelected=building.id===selectedId; const style={left:building.anchor.left,top:building.anchor.top,width:building.anchor.width,height:building.anchor.height} as CSSProperties; return <button type="button" key={building.id} className={'building-selection-anchor '+(isSelected?'is-selected':'')} style={style} data-building-id={building.id} aria-label={'选择建筑 '+building.name} aria-pressed={isSelected} onPointerDown={(event)=>event.stopPropagation()} onClick={()=>onSelect(building.id)}><span className="building-selection-anchor__outline" aria-hidden="true"/><span className="building-selection-anchor__label">{building.name}</span></button>;})}
 {selected&&focusPulse>0&&<span key={selected.id+'-'+focusPulse} className="building-selection-focus-pulse" style={{left:selected.anchor.left,top:selected.anchor.top,width:selected.anchor.width,height:selected.anchor.height}} aria-hidden="true"/>}
 </div>;
}
