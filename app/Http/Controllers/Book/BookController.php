<?php

namespace App\Http\Controllers\Book;

use App\Repositories\Book\BookmarksRepository;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Repositories\Book\BookRepository;
use App\Repositories\Book\RatingRepository;
use App\Http\Controllers\Controller;
use App\Managers\EpubManager;
use Storage;
use Auth;


class BookController extends Controller
{
    protected $bookRepository;
    protected $ratingRapository;
    protected $epubManager;
    protected $bookmarkRepository;

    public function __construct(
        BookRepository $bookRepository,
        RatingRepository $ratingRepository,
        BookmarksRepository $bookmarksRepository,
        EpubManager $epubMan

    ) {
        $this->bookRepository = $bookRepository;
        $this->ratingRapository = $ratingRepository;
        $this->epubManager = $epubMan;
        $this->bookmarkRepository = $bookmarksRepository;
    }


    /**
     * Accepted parameters ['query', 'author', 'genre', 'lang']
     *
     * @param Request $request
     * @return 
     */
    public function search(Request $request)
    {
        $books = $this->bookRepository->search($request->all());
        return view('book.search', compact('books'));
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {

    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */

    public function show($id)
    {

        $book = $this->bookRepository->getById($id);
        $ratings = $this->ratingRapository->getRatingId($id);
        if (Auth::check()) {
            $estEvalue = $this->ratingRapository->getRatingIdEtUser($id,Auth::user()->id );
            $user = Auth::user();
            $followers = $user->subscriptionsTo;
        }

        return view('book/detailsBook', compact('book', 'estEvalue', 'followers'))->with('data',
            $ratings);

    }

    /**
     * ouverture d'un livre
     * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
     */
    public function open($id)
    {
        $book = $this->bookRepository->getById($id);
        $id_book = basename($book->url);
        $bookmarks = $this->bookmarkRepository->getBookmarkIdAndUser($id, Auth::user()->id);
        $bookmark = null;
        foreach($bookmarks as $bm){
            $bookmark = $bm;
        }

        $file_exists = Storage::disk('public')->exists('Books/Book' . $id_book . '.epub');
        if (!$file_exists) {
            $this->epubManager->download_book($id_book);
        }

        return view('book/basic', compact('id_book', 'bookmark', 'id'));
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
