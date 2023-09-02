const defaults = {
    borderWidth: 8,
    borderHeight: 8,
    cellSize: '80px',
    pieceRows: 300
}
const team = {first: 0, second: 1}

const boardSizeAttr = 'size';
const cellSizeAttr = 'cell-size';

const cellSizeProp = '--cell-size';
const boardWidthProp = '--board-width';
const boardHeightProp = '--board-height';

const piecePosXProp = "--pos-x";
const piecePosYProp = "--pos-y";
const pieceTeamProp = "--team";

const secondTeamPieceCl = 'piece_second-team';
const pieceHoverCl = 'piece__hover';
const cellHighLightCl = 'board__cell_highlighted';

const boards = document.querySelectorAll('.board');


boards.forEach(SetupGame);


function SetupGame(board) {
    const highlightedCells = [];
    let activePiece = null;
    let turn = team.first;

    SetBoardSize(board);
    SetCellSize(board);
    const boardCells = FillBoardWithCells(board);
    const boardPieces = CreateBoardMatrix(board);
    AddFirstTeamPieces(board);
    AddSecondTeamPieces(board);


    function CreateBoardMatrix(board) {
        const height = Height(board);
        const width = Width(board);

        return new Array(width * height);
    }

    function AddFirstTeamPieces(board) {
        const width = Width(board);
        const height = Math.min(Math.round(Height(board) * .5 - 1), defaults.pieceRows);
        const boardHeight = Height(board);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let realY = boardHeight - 1 - y;
                if (!Even(x)) {
                    const piece = CreatePiece(board, x, realY);
                    MarkPiecePlayable(piece);
                    SetPiece(piece, x, realY);
                }
            }
        }
    }

    function AddSecondTeamPieces(board) {
        const width = Width(board);
        const height = Math.min(Math.round(Height(board) * .5 - 1), defaults.pieceRows);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (!Even(x)) {
                    const piece = CreatePiece(board, x, y);
                    MarkPieceSecondTeam(piece);
                    MarkPiecePlayable(piece);
                    SetPiece(piece, x, y);
                }
            }
        }
    }


    function MarkPieceSecondTeam(piece) {
        piece.classList.add(secondTeamPieceCl);
        piece.style.setProperty(pieceTeamProp, team.second);
    }

    function MarkPiecePlayable(piece) {
        const pieceTeam = Team(piece);

        piece.addEventListener('click', () => {
            if (turn === pieceTeam)
                SetActive(piece)
        })
    }

    function SetActive(piece) {
        Unhover(activePiece);
        activePiece = piece;
        Hover(activePiece);
    }

    function Hover(piece) {
        if (piece == null)
            return;

        piece.classList.add(pieceHoverCl);
        ShowAvailableMoves(piece);
    }

    function Unhover(piece) {
        if (piece == null)
            return;

        piece.classList.remove(pieceHoverCl);
        UnhighlightCells();
    }

    function ShowAvailableMoves(piece) {
        let moves = [];
        BaseMoves(piece)

        for (const path of moves) {
            const endPoint = path[path.length - 1];
            HighlightCell(endPoint.x, endPoint.y, path);
        }


        function BaseMoves(piece) {
            const pieceX = PosX(piece);
            const pieceY = PosY(piece);

            for (let i = -1; i <= 1; i += 2) {
                const moveX = pieceX + i;
                const moveY = turn === team.first ? pieceY - 1 : pieceY + 1;

                if (OnBord(moveX, moveY) && Free(moveX, moveY))
                    moves.push([{x: moveX, y: moveY}])
            }
        }
    }


    function OnBord(x, y) {
        return 0 <= x
            && 0 <= y
            && x < Width(board)
            && y < Height(board)
    }

    function Free(x, y) {
        return GetPiece(x, y) == null;
    }

    function GetPiece(x, y) {
        return boardPieces[y * Width(board) + x];
    }

    function SetPiece(piece, x, y) {
        boardPieces[y * Width(board) + x] = piece;
    }

    function Team(piece) {
        return Number(piece.style.getPropertyValue(pieceTeamProp));
    }

    function HighlightCell(x, y) {
        x = Odd(y) ? boardCells.length - 1 - x : x;
        let cell = boardCells[y][x];
        cell.classList.add(cellHighLightCl);
        highlightedCells.push(cell);
    }

    function UnhighlightCells() {
        for (const cell of highlightedCells) {
            cell.classList.remove(cellHighLightCl);
        }
    }

    function SwitchTurn() {
        switch (turn) {
            case team.first:
                turn = team.second;
                break;
            case team.second:
                turn = team.first;
                break;
        }
    }


    function MoveTo(piece, x, y, instantly) {
        const pieceX = PosX(piece);
        const pieceY = PosY(piece);

        if (pieceX === x && pieceY === y)
            return;

        if (instantly)
            piece.style.transition = 'none';

        x = Odd(y) ? boardCells.length - 1 - x : x;

        console.log(`coords: ${x} ${y}`)
        SetPiece(piece, x, y);
        SetPiece(null, pieceX, pieceY);

        piece.style.setProperty(piecePosXProp, x);
        piece.style.setProperty(piecePosYProp, y);

        if (instantly)
            piece.style.transition = null;
    }

    function CreatePiece(board, x, y) {
        const piece = document.createElement('div');
        piece.classList.add('piece');
        board.appendChild(piece);

        x = Odd(y) ? boardCells.length - 1 - x : x;
        piece.style.setProperty(piecePosXProp, x);
        piece.style.setProperty(piecePosYProp, y);
        SetPiece(piece, x, y);

        piece.style.left = `calc(var(${cellSizeProp}) * var(${piecePosXProp}))`;
        piece.style.top = `calc(var(${cellSizeProp}) * var(${piecePosYProp}))`;
        piece.style.setProperty(pieceTeamProp, team.first);

        return piece;
    }
}


function SetBoardSize(board) {
    let width = defaults.borderWidth;
    let height = defaults.borderHeight;

    if (board.hasAttribute(boardSizeAttr)) {
        const size = board.getAttribute(boardSizeAttr).split(' ');
        width = size[0];
        height = size[1];
    }

    board.style.setProperty(boardWidthProp, width);
    board.style.setProperty(boardHeightProp, height);
    return {width: width, height: height}
}

function SetCellSize(board) {
    if (board.hasAttribute(cellSizeAttr)) {
        board.style.setProperty(cellSizeProp, board.getAttribute(cellSizeAttr));
    } else {
        board.style.setProperty(cellSizeProp, defaults.cellSize);
    }
}

function FillBoardWithCells(board) {
    const width = Width(board);
    const height = Height(board);

    const cells = [];

    for (let i = 0; i < height; i++) {
        const row = CreateRow(width);
        cells.push(row.cells)
        board.appendChild(row.object);
    }

    return cells;
}

function CreateRow(width) {
    const cells = [];
    const row = document.createElement('div');
    row.classList.add('board__row');

    for (let j = 0; j < width; j++) {
        const cell = CreateCell();
        cells.push(cell);
        row.appendChild(cell);
    }

    return {object: row, cells: cells};
}

function CreateCell() {
    const cell = document.createElement('div');
    cell.classList.add('board__cell');
    return cell;
}


function PosX(piece) {
    return Number(piece.style.getPropertyValue(piecePosXProp));
}

function PosY(piece) {
    return Number(piece.style.getPropertyValue(piecePosYProp));
}


function Width(board) {
    return Number(board.style.getPropertyValue(boardWidthProp));
}

function Height(board) {
    return Number(board.style.getPropertyValue(boardHeightProp));
}


function Odd(n) {
    return n % 2 === 1;
}

function Even(n) {
    return !Odd(n);
}