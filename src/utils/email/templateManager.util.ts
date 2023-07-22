/* eslint-disable @typescript-eslint/no-explicit-any */
import pug from 'pug';

/**
 * TemplateManager class for managing email templates.
 *
 * This class provides methods for rendering email templates using the Pug templating engine.
 */
class TemplateManager {
  /**
   * Renders an email template using the Pug templating engine.
   *
   *  _Make sure you have a templates folder(for the pug templates) at the same level with your utils folder_
   * @param template - The template file name without extension.
   * @param variables - The variables to be passed to the email template.
   * @returns The rendered HTML string.
   *
   * @example
   * ```ts
   * const html = templateManager.render("template_name",object_containing_data_to_show_in_template);
   * ```
   */
  render(template: string, variables: Record<string, any>): string {
    const templatePath = `${__dirname}/../../templates/email/${template}.pug`;
    const html = pug.renderFile(templatePath, variables);
    return html;
  }
}

export default TemplateManager;
