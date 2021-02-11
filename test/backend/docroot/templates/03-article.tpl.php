<div class="page" id="article">
  {{> components-header }}
  <div role="main">
    <div class="l-two-col">
      <div class="l-main">
        <article class="article">
          <header class="article-header">
            <h1>{{ article_title }}</h1>
          </header>
          {{> compounds-block-dagwood }}
        </article><!--end .article-->
      </div><!--end l-main-->

      <div class="l-sidebar">
        {{> components-latest-posts }}
        {{> components-pagination }}
      </div><!--end l-sidebar-->
    </div><!--end l-two-col-->
  </div><!--End role=main-->
  {{> components-footer }}
</div>
