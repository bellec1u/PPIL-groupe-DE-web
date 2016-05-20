@extends('template')

@section('contenu')
		<article class="panel panel-info">
			<h1 class="panel-heading">Détails du Livre</h1>
			<div class="panel-body">
				<img src="{{ $book->cover_url  }}" alt="" />
				<p>Titre : {{ $book->title  }}</p>
				<p>Auteur : {{ $book->author  }}</p>
				<p>Genre : {{ $book->genre  }}</p>
				<p>Langue : {{ $book->language  }}</p>
				<p>Date de Parution : {{ date('d-m-Y', strtotime($book->publication_date))  }}</p>
				<p>Note moyenne : {{ $book->stars_average  }}</p>
				<p><a href="{{URL::route('bookOpen', array('id'=>$book->id, 'path'=>Request::url()))}}" class="btn bg-primary">Ouvrir</a></p>
				@if(Auth::check())
				<p>{!! link_to('createRating/'.$book->id, 'Evaluer', $attribute = array(), $secrure = null ) !!}</p>
				{!! link_to('book/'.$book->id, 'ajouter a sa bibliothèque', $attribute = array(), $secrure = null ) !!}
				@endif
				@foreach($data as $rating)
					@if(Auth::Check())
					@if(Auth::user()->id == $rating->user_id)
						{!! link_to('editRating/'.$rating->id, 'Modifier', $attribute = array(), $secrure = null ) !!}
					@endif
					@endif
					<p> Commentaire {{ $rating->comment }} </p>
					<p> Note {{ $rating->stars }} </p>
				@endforeach
			</div>
		</article>
		<!--<a href="javascript:history.back()" class="btn btn-primary">
			<span class="glyphicon glyphicon-circle-arrow-left"></span> Retour
		</a>-->
@stop