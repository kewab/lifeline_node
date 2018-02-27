var game;

function start( game ){
	this.game = game;
	
}

function fetchMessagesForNode(nodeId){
	try{
		return this.game.nodes[nodeId-1].textLines;
	}catch(err){
		throw 'Looks like you didn\'t call the \'start\' method first.';

	}
}

function fetchOptions(nodeId){
	return this.game.nodes[nodeId-1].choices;
}

function fetchSeconds(nodeId){
	return this.game.nodes[nodeId-1].delay_seconds;
}

function fetchIsTerminalNode(nodeId){
	return this.game.nodes[nodeId-1].isTerminalNode;
}

function fetchParentId(nodeId){
	return this.game.nodes[nodeId-1].parentId;
}

module.exports = {
	start : start,
	fetchMessagesForNode : fetchMessagesForNode,
	fetchOptions : fetchOptions,
	fetchSeconds : fetchSeconds,
	fetchIsTerminalNode:fetchIsTerminalNode,
	fetchParentId:fetchParentId
}