
const PageButton = ({ pg, page, setPage }) => { 
    if(pg === page) {
        return <button className="rounded-2 p-1 px-2 m-1 fw-bold">{pg}</button>
    } else {
        return <button className="rounded-2 p-1 px-2 m-1" onClick={() => setPage(pg)}>{pg}</button>
    }
};

export default PageButton;
