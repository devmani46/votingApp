'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">new-component-test documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/BurgerMenu.html" data-type="entity-link" >BurgerMenu</a>
                            </li>
                            <li class="link">
                                <a href="components/Button.html" data-type="entity-link" >Button</a>
                            </li>
                            <li class="link">
                                <a href="components/CampaignCard.html" data-type="entity-link" >CampaignCard</a>
                            </li>
                            <li class="link">
                                <a href="components/CampaignStatus.html" data-type="entity-link" >CampaignStatus</a>
                            </li>
                            <li class="link">
                                <a href="components/CdkTable.html" data-type="entity-link" >CdkTable</a>
                            </li>
                            <li class="link">
                                <a href="components/CreateCampaign.html" data-type="entity-link" >CreateCampaign</a>
                            </li>
                            <li class="link">
                                <a href="components/DetailCards.html" data-type="entity-link" >DetailCards</a>
                            </li>
                            <li class="link">
                                <a href="components/Footer.html" data-type="entity-link" >Footer</a>
                            </li>
                            <li class="link">
                                <a href="components/FuiField.html" data-type="entity-link" >FuiField</a>
                            </li>
                            <li class="link">
                                <a href="components/FuiInput.html" data-type="entity-link" >FuiInput</a>
                            </li>
                            <li class="link">
                                <a href="components/Login.html" data-type="entity-link" >Login</a>
                            </li>
                            <li class="link">
                                <a href="components/Menu.html" data-type="entity-link" >Menu</a>
                            </li>
                            <li class="link">
                                <a href="components/ModeratorManagement.html" data-type="entity-link" >ModeratorManagement</a>
                            </li>
                            <li class="link">
                                <a href="components/NavBar.html" data-type="entity-link" >NavBar</a>
                            </li>
                            <li class="link">
                                <a href="components/NotificationBlock.html" data-type="entity-link" >NotificationBlock</a>
                            </li>
                            <li class="link">
                                <a href="components/Notifications.html" data-type="entity-link" >Notifications</a>
                            </li>
                            <li class="link">
                                <a href="components/Register.html" data-type="entity-link" >Register</a>
                            </li>
                            <li class="link">
                                <a href="components/UserCampaign.html" data-type="entity-link" >UserCampaign</a>
                            </li>
                            <li class="link">
                                <a href="components/UserManagement.html" data-type="entity-link" >UserManagement</a>
                            </li>
                            <li class="link">
                                <a href="components/UserPage.html" data-type="entity-link" >UserPage</a>
                            </li>
                            <li class="link">
                                <a href="components/VoteCandidate.html" data-type="entity-link" >VoteCandidate</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CampaignService.html" data-type="entity-link" >CampaignService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ModeratorService.html" data-type="entity-link" >ModeratorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NotificationService.html" data-type="entity-link" >NotificationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageService.html" data-type="entity-link" >StorageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/Campaign.html" data-type="entity-link" >Campaign</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Candidate.html" data-type="entity-link" >Candidate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FieldMessage.html" data-type="entity-link" >FieldMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FileItem.html" data-type="entity-link" >FileItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginResponse.html" data-type="entity-link" >LoginResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Moderator.html" data-type="entity-link" >Moderator</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Notification.html" data-type="entity-link" >Notification</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});