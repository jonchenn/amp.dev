# -*- coding: utf-8 -*-
from grow import extensions
from grow.documents import document_format
from grow.extensions import hooks
from markdown.extensions import extra
from html_block_processor import HtmlBlockProcessor

CLEAR_EXTRA_EXTENSIONS_FLAG = 'prevent_markdown_extra_auto_loading_other'


class AddMarkdownAttributePreRenderHook(hooks.PreRenderHook):
  """Handle the pre-render hook."""

  def should_trigger(self, previous_result, doc, original_body, *_args,
                       **_kwargs):
    # Only trigger for non-empty documents
    content = previous_result if previous_result else original_body
    if content is None:
      return False

    # Only trigger for MarkdownDocuments
    if not isinstance(doc.format, document_format.MarkdownDocumentFormat):
      return False

    return True

  def trigger(self, previous_result, doc, raw_content, *_args, **_kwargs):
    content = previous_result if previous_result else raw_content
    return HtmlBlockProcessor().addMarkdownAttributes(content)


class MarkdownInHtmlExtension(extensions.BaseExtension):
  """Markdown in HTML Extension."""

  def __init__(self, pod, config):
    super(MarkdownInHtmlExtension, self).__init__(pod, config)

    if config.has_key(CLEAR_EXTRA_EXTENSIONS_FLAG) and config.get(CLEAR_EXTRA_EXTENSIONS_FLAG):
      # Clear the markdown extra extensions to prevent auto loading unwanted extensions
      extra.extensions = []

  @property
  def available_hooks(self):
    """Returns the available hook classes."""
    return [
      AddMarkdownAttributePreRenderHook,
    ]
