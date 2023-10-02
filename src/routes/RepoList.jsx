/* eslint-disable react/prop-types */

import { Link, useParams } from "react-router-dom";
import RepoCard from "../components/UI/RepoCard";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import RepoListHeader from "../components/RepoListHeader";

const ThrowError = ({ error }) => {
  if (
    error.response.data.message.split(" ").slice(0, 3).join(" ") ===
    "API rate limit"
  ) {
    return (
      <p className="text-red-400">
        We have hit a rate limit , service will be resumed shortly
      </p>
    );
  }

  return <p className="text-red-400">OOPS something went wrong</p>;
};

const RepoList = () => {
  const { lang } = useParams();

  const fetchRepo = async (page) => {
    const apiUrl = `https://api.github.com/search/repositories?q=topic%3Ahacktoberfest+language%3A${lang}&per_page=21&page=${page}`;
    const response = await axios.get(apiUrl);

    return response.data.items;
  };

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ["Repo", lang],
    async ({ pageParam = 1 }) => {
      const response = await fetchRepo(pageParam);
      return response;
    },
    {
      getNextPageParam: (_, next) => {
        return next.length + 1;
      },
    }
  );

  if (error) console.log(error);

  return (
    <div className="container mx-auto h-full pt-16">
      <div className="min-h-screen pt-5">
        <div className="text-center">
          <RepoListHeader lang={lang}/>
          {error && <ThrowError error={error} />}
          {isLoading && <p className="text-center">Loading...</p>}
          {error && <p>Oops something went wrong</p>}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data &&
              data.pages.map((page) =>
                page?.map((repo) => <RepoCard repo={repo} key={repo.id} />)
              )}
          </div>
        </div>
      </div>

      <div className="w-full flex flex-row gap-4 justify-center items-center">
        <button
          className="btn  btn-primary my-10 "
          onClick={() => fetchNextPage()}
        >
          {" "}
          {isFetchingNextPage
            ? "Loading more..."
            : hasNextPage
            ? "Next Page"
            : "Nothing more to load"}
        </button>
        <Link to="/" className="btn  btn-secondary my-10 ">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default RepoList;
