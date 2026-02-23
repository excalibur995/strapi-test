import type { Schema, Struct } from '@strapi/strapi';

export interface UiAuthenticationForm extends Struct.ComponentSchema {
  collectionName: 'components_ui_authentication_forms';
  info: {
    displayName: 'Authentication Form';
  };
  attributes: {
    emailPlaceholder: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'example@gmail.com'>;
    enableRememberMe: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showPasswordToggle: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    submitButtonLabel: Schema.Attribute.String;
    submitEndpoint: Schema.Attribute.String;
    submitTarget: Schema.Attribute.String;
  };
}

export interface UiFooterAction extends Struct.ComponentSchema {
  collectionName: 'components_ui_footer_actions';
  info: {
    displayName: 'Footer Action';
  };
  attributes: {
    actionLabel: Schema.Attribute.String;
    actionTargetRoute: Schema.Attribute.String;
    promptText: Schema.Attribute.String;
  };
}

export interface UiIllustrationHeader extends Struct.ComponentSchema {
  collectionName: 'components_ui_illustration_headers';
  info: {
    displayName: 'Illustration Header';
  };
  attributes: {
    backgroundColor: Schema.Attribute.String;
    illustration: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    title: Schema.Attribute.String;
  };
}

export interface UiSocialLoginGroup extends Struct.ComponentSchema {
  collectionName: 'components_ui_social_login_groups';
  info: {
    displayName: 'Social Login Group';
  };
  attributes: {
    dividerText: Schema.Attribute.String;
    enableApple: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    enableGoogle: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'ui.authentication-form': UiAuthenticationForm;
      'ui.footer-action': UiFooterAction;
      'ui.illustration-header': UiIllustrationHeader;
      'ui.social-login-group': UiSocialLoginGroup;
    }
  }
}
