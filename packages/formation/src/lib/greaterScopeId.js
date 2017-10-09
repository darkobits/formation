import {path} from 'ramda';
import invoke from './invoke';


/**
 * Provided two objects that implement a '$getScope' method (ie: Forms and
 * FormGroups), returns the object with the greater $scope.$id. This is used to
 * determine which object is likely to be lower in the scope hierarchy.
 *
 * @param  {object} a
 * @param  {object} b
 * @return {object}
 */
export default function greaterScopeId (a, b) {
  const aId = path(['$id'], invoke('$getScope', a)) || 0;
  const bId = path(['$id'], invoke('$getScope', b)) || 0;
  return Number(aId) > Number(bId) ? a : b;
}
