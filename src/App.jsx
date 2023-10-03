import { useQuery } from "react-query";
import { useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import Guide from "./Components/Guide";
import PageButton from "./Components/PageButton";
import globalInstance from "./Utils/Axios/GlobalInstance";

// @see https://tanstack.com/query/latest/docs/react/overview

function App() {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5);

    
    async function getGuidesPage(page = 1) {
        const response = await globalInstance.get(`/example?page=${page}`);

        setTotalPages(Math.ceil(response.data?.guides.total / response.data?.guides.per_page));

        return response.data?.guides;
    };

    const {
        isLoading,
        isError,
        error,
        data: guides,
        isFetching,
        isPreviousData,
    } = useQuery(["/guides", page], () => getGuidesPage(page), {
        keepPreviousData: true
    })

    if(isLoading) {
        return <p>Loading Guides...</p>
    }

    if(isError) {
        return <p>Error: {error.message}</p>
    }

    const content = guides.data.map(guide => <Guide key={guide.id} guide={guide} />)

    const lastPage = () => setPage(totalPages)

    const firstPage = () => setPage(1)

    const pagesArray = Array(totalPages).fill().map((_, index) => index + 1)

    return (
        <>
            <h1>Happy App!!</h1>
            <button className="rounded-2 p-1 m-1" onClick={firstPage} disabled={isPreviousData || page === 1}>&lt;&lt;</button>
            <button className="rounded-2 p-1 m-1"
                onClick={() => setPage(old => Math.max(old - 1, 0))}
                disabled={page === 1}
            >Previous Page</button>

            {pagesArray.map(pg => <PageButton key={pg} pg={pg} page={page} setPage={setPage} />)}

            <button className="rounded-2 p-1 m-1"
                onClick={() => {
                    if(!isPreviousData && guides.data?.length >= 1) {
                        setPage(old => old + 1)
                    }
                }}
                disabled={isPreviousData || page >= totalPages}
            >Next Page</button>

            <button className="rounded-2 p-1 m-1" onClick={lastPage} disabled={isPreviousData || page === totalPages}>&gt;&gt;</button>
            
            {content}
        </>
    );
};

export default App;
