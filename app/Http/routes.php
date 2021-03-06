<?php
/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/
/*
 * Web Routes
 */
Route::group(['middleware' => 'web'], function () {

    Route::get('/home', 'HomeController@index');

    Route::get('/', array('uses'=>'HomeController@index', 'as' =>'/'));

    Route::get('faq', function () {
        return view('faq');
    });

    Route::get('contact', function () {
        return view('user/contact');
    });

    Route::get('cgu', function () {
        return view('cgu');
    });



    Route::get('connexion', function () {
        return view('user/connexion');
    });

    Route::get('create', function () {
        return view('user/create');
    });

    Route::get('email_contact', function () {
        return view('user/email_contact');
    });

    //Juste un teste pour la consultation de la bibliotheque perso
    Route::get('consulter_biblio', function () {
        return view('consulter');
    });



    Route::auth();
    // standard
    Route::resource('user', 'User\UserController',
        ['except' => ['index', 'edit', 'update', 'show', 'destroy']]);
    Route::get('user/profile', 'User\UserController@profile');
    Route::put('user/update',
        ['uses' => 'User\UserController@update', 'as' => 'userUpdate']);
    Route::delete('user',
        ['uses' => 'User\UserController@delete', 'as' => 'userDelete']);
    Route::get('user/edit',
        ['uses' => 'User\UserController@edit', 'as' => 'userEdit']);
    Route::get('user/consult/{id}', [
        'uses' => 'User\UserController@showOther',
        'as'   => 'showOtherUser'
    ])->where('id', '[0-9]+');

    Route::get('registration' , ['uses'=>'User\UserController@registration', 'as'=>'registration']);
    Route::post('following_allowed' , ['uses'=>'User\UserController@following_allowed', 'as'=>'following_allowed']);


    // email validation
    Route::get('user/verify/{token}', 'User\UserController@confirmEmail')
        ->where('token', '[a-zA-Z0-9]+');
    Route::get('user/{id}/resend',
        ['as' => 'resendEmail', 'uses' => 'User\UserController@resendEmail'])
        ->where('id', '[0-9]+');
    //subscriptions
    Route::post('follow',
        ['uses' => 'User\SubscriptionController@store', 'as' => 'addFollower']);
    Route::get('follow',
        ['uses' => 'User\SubscriptionController@show', 'as' => 'ConsultFollower']);
    Route::delete('follow/delete/{id}',
        ['uses' => 'User\SubscriptionController@delete', 'as' => 'deleteFollower']);
    Route::put('follow/update/{id}',
        ['uses' => 'User\SubscriptionController@update', 'as' => 'updateFollower']);


    // notidication
    Route::get('notification/',
        ['uses' => 'User\NotificationController@show', 'as' => 'showNotification']);
    // facebook and google+ users connection
    Route::get('/redirect/{provider}', 'Auth\SocialAuthController@redirect');
    Route::get('/callback/{provider}', 'Auth\SocialAuthController@callback');


    // Book access
    // details
    Route::get('book/{id}', ['as' => 'bookReturn', 'uses' => 'Book\BookController@show'])->where('id', '[0-9]+');
    Route::get('book/{id}/open/', ['as' => 'bookOpen', 'uses' => 'Book\BookController@open'])->where('id', '[0-9]+');
    Route::get('book/search', ['as' => 'bookSearch', 'uses' => 'Book\BookController@search']);


    // Book modif
    Route::get('createRating/{id}',['uses' => 'Book\RatingController@create', 'as' => 'createRating'])->where('id', '[0-9]+');
    Route::post('storeRating', ['uses' => 'Book\RatingController@store', 'as' => 'storeRating']);
    Route::get('destroyRating/{id}/{idbook}', 'Book\RatingController@destroy')->where('id', '[0-9]+')->where('idbook', '[0-9]+');
    Route::get('editRating/{id}', 'Book\RatingController@edit')->where('id', '[0-9]+');
    Route::post('updateRating', ['uses' => 'Book\RatingController@update', 'as' => 'updateRating']);

    // bookMarks
    Route::get('addBookmarks/{idBook}/', ['uses' => 'Book\BookMarksController@add', 'as' => 'addBookmarks']);
    Route::get('isBookmarks/{idBook}/', ['uses' => 'Book\BookMarksController@isActualBookmark', 'as' => 'isBookmarks']);

    // liste de lecture.
    Route::get('bookshelf/add/{id}', ['uses' => 'Book\ReadingController@add', 'as' => 'addReading'])->where('id', '[0-9]+');
    Route::get('bookshelf', ['uses' => 'Book\ReadingController@show', 'as' => 'showReading']);
    Route::get('bookshelf/delete/{id}', ['uses' => 'Book\ReadingController@destroy', 'as' => 'deleteReading'])->where('id', '[0-9]+');;

});


/*
 * API Routes
 */
Route::group(['prefix' => 'api', 'middleware' => 'api'], function () {
    Route::post('user/register', 'Api\JWTAuthController@store');
    Route::post('user/login', 'Api\JWTAuthController@login');
    Route::get('user/logout', ['middleware' => 'jwt.auth',
        'uses' => 'Api\JWTAuthController@logout']);
});
