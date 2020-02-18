import * as m from 'mithril';
import SearchViewModel from '../../ViewModel/Search/SearchViewModel';
import factory from '../../ViewModel/ViewModelFactory';
import SearchOptionBaseComponent from './SearchOptionBaseComponent';

/**
 * SearchOptionComponent
 */
class SearchOptionComponent extends SearchOptionBaseComponent<void> {
    private viewModel: SearchViewModel;

    constructor() {
        super();
        this.viewModel = <SearchViewModel> factory.get('SearchViewModel');
    }

    public view(): m.Child {
        return m('div', { class: 'option-card mdl-card mdl-shadow--2dp mdl-cell mdl-cell--12-col' }, [
            m('div', { class: 'mdl-card__supporting-text' }, [
                this.createKeyword(),
                this.createIgnoreKeyword(),
                this.createBroadcaster(),
                this.createGenres(),
                this.createTimes(),
                this.createDuration(),
                this.createOther(),
            ]),
            this.createActionButtons(),
        ]);
    }

    /**
     * キーワード
     * @return keyword option
     */
    private createKeyword(): m.Child {
        return this.createContentFrame('キーワード', [
            m('div', { class: 'option-text-box mdl-cell--12-col mdl-textfield mdl-js-textfield' }, [
                 m('input', {
                    class: 'mdl-textfield__input',
                    type: 'text',
                    placeholder: 'keyword',
                    value: this.viewModel.keyword,
                    onchange: (e: Event) => { this.viewModel.keyword = (<HTMLInputElement> e.target!).value; },
                    onupdate: (vnode: m.VnodeDOM<void, this>) => {
                        // enter key で検索
                        (<HTMLInputElement> vnode.dom).onkeydown = (e) => {
                            if (e.keyCode === 13) {
                                this.viewModel.keyword = (<HTMLInputElement> vnode.dom).value;
                                this.viewModel.search();
                                (<HTMLInputElement> vnode.dom).blur();
                            }
                        };
                    },
                }),
            ]),

            m('div', {
                class: 'mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no',
                style: 'padding: 0;',
            }, [
                this.createCheckBox(
                    '大小区別',
                    () => { return this.viewModel.keyCS; },
                    (value: boolean) => { this.viewModel.keyCS = value; },
                ),
                this.createCheckBox(
                    '正規表現',
                    () => { return this.viewModel.keyRegExp; },
                    (value: boolean) => { this.viewModel.keyRegExp = value; },
                ),
                this.createCheckBox(
                    'タイトル',
                    () => { return this.viewModel.title; },
                    (value: boolean) => { this.viewModel.title = value; },
                ),
                this.createCheckBox(
                    '概要',
                    () => { return this.viewModel.description; },
                    (value: boolean) => { this.viewModel.description = value; },
                ),
                this.createCheckBox(
                    '詳細',
                    () => { return this.viewModel.extended; },
                    (value: boolean) => { this.viewModel.extended = value; },
                ),
            ]),
        ]);
    }

    /**
     * 除外キーワード
     * @return ignore keyword option
     */
    private createIgnoreKeyword(): m.Child {
        return this.createContentFrame('除外キーワード', [
            m('div', { class: 'option-text-box mdl-cell--12-col mdl-textfield mdl-js-textfield' }, [
                 m('input', {
                    class: 'mdl-textfield__input',
                    type: 'text',
                    placeholder: 'ignore keyword',
                    value: this.viewModel.ignoreKeyword,
                    onchange: (e: Event) => { this.viewModel.ignoreKeyword = (<HTMLInputElement> e.target!).value; },
                    onupdate: (vnode: m.VnodeDOM<void, this>) => {
                         // enter key で検索
                        (<HTMLInputElement> vnode.dom).onkeydown = (e) => {
                            if (e.keyCode === 13) {
                                this.viewModel.ignoreKeyword = (<HTMLInputElement> vnode.dom).value;
                                this.viewModel.search();
                                (<HTMLInputElement> vnode.dom).blur();
                            }
                        };
                    },
                }),
            ]),

            m('div', {
                class: 'mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no',
                style: 'padding: 0;',
            }, [
                this.createCheckBox(
                    '大小区別',
                    () => { return this.viewModel.ignoreKeyCS; },
                    (value: boolean) => { this.viewModel.ignoreKeyCS = value; },
                ),
                this.createCheckBox(
                    '正規表現',
                    () => { return this.viewModel.ignoreKeyRegExp; },
                    (value: boolean) => { this.viewModel.ignoreKeyRegExp = value; },
                ),
                this.createCheckBox(
                    'タイトル',
                    () => { return this.viewModel.ignoreTitle; },
                    (value: boolean) => { this.viewModel.ignoreTitle = value; },
                ),
                this.createCheckBox(
                    '概要',
                    () => { return this.viewModel.ignoreDescription; },
                    (value: boolean) => { this.viewModel.ignoreDescription = value; },
                ),
                this.createCheckBox(
                    '詳細',
                    () => { return this.viewModel.ignoreExtended; },
                    (value: boolean) => { this.viewModel.ignoreExtended = value; },
                ),
            ]),
        ]);
    }

    /**
     * 放送局 & 放送波チェックボックス
     */
    private createBroadcaster(): m.Child {
        return this.createContentFrame('放送局', [
            // 放送局プルダウン
            m('div', { style: 'display: flex; width: 100%;' }, [
                 m('div', { class: 'pulldown mdl-layout-spacer' }, [
                    m('select', {
                        value: this.viewModel.station,
                        onchange: (e: Event) => { this.viewModel.station = parseInt((<HTMLInputElement> e.target!).value, 10); },
                    }, [
                        m('option', { value: '0' }, 'すべて'),
                        this.viewModel.getChannels().map((channel) => {
                            return m('option', { value: channel.id }, channel.name);
                        }),
                    ]),
                ]),
            ]),

            m('div', {
                class: 'mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no',
                style: 'margin-top: 12px; padding: 0;',
            }, this.createBroadCastCheckBox()),
        ]);
    }

    /**
     * 放送波のチェックボックス生成
     */
    private createBroadCastCheckBox(): m.Child[] {
        const result: m.Child[] = [];

        result.push(this.createCheckBox(
            'GR',
            () => { return this.viewModel.GR; },
            (value: boolean) => { this.viewModel.GR = value; },
        ));

        result.push(this.createCheckBox(
            'BS',
            () => { return this.viewModel.BS; },
            (value: boolean) => { this.viewModel.BS = value; },
        ));

        result.push(this.createCheckBox(
            'CS',
            () => { return this.viewModel.CS; },
            (value: boolean) => { this.viewModel.CS = value; },
        ));

        result.push(this.createCheckBox(
            'SKY',
            () => { return this.viewModel.SKY; },
            (value: boolean) => { this.viewModel.SKY = value; },
        ));

        return result;
    }

    /**
     * 対象ジャンル
     */
    private createGenres(): m.Child {
        return this.createContentFrame('対象ジャンル', [
            // ジャンルセレクタ
            m('div', { style: 'display: flex; width: 50%;' }, [
                m('div', { class: 'pulldown mdl-layout-spacer' }, [
                    m('select', {
                        value: this.viewModel.genrelv1,
                        onchange: (e: Event) => {
                            this.viewModel.genrelv1 = parseInt((<HTMLInputElement> e.target!).value, 10);
                            this.viewModel.initGenre2();
                        },
                    },
                        m('option', { value: '-1' }, 'すべて'),
                        this.viewModel.getGenre1().map((genre) => {
                            return m('option', { value: genre.value }, genre.name);
                        }),
                    ),
                ]),
            ]),

            // サブジャンルセレクタ
            m('div', { style: 'display: flex; width: 50%;' }, [
                m('div', { class: 'pulldown mdl-layout-spacer' }, [
                    m('select', {
                        value: this.viewModel.genrelv2,
                        onchange: (e: Event) => { this.viewModel.genrelv2 = parseInt((<HTMLInputElement> e.target!).value, 10); },
                    },
                        m('option', { value: '-1' }, 'すべて'),
                        this.viewModel.getGenre2().map((genre) => {
                            return m('option', { value: genre.value }, genre.name);
                        }),
                    ),
                ]),
            ]),
        ]);
    }

    /**
     * 対象時刻 & 曜日
     */
    private createTimes(): m.Child {
        return this.createContentFrame('対象時刻', [
            // 開始時刻セレクタ
            m('div', [
                m('div', { class: 'pulldown mdl-layout-spacer' }, [
                    m('select', {
                        value: this.viewModel.startTime,
                        onchange: (e: Event) => {
                            this.viewModel.startTime = parseInt((<HTMLInputElement> e.target!).value, 10);
                        },
                    }, this.createStartTimeOption()),
                ]),
            ]),

            m('div', {
                style: 'padding: 0px 12px; font-size: 16px; margin-top: 12.5px;',
            }, 'から'),

            // 時刻幅セレクタ
            m('div', [
                m('div', { class: 'pulldown mdl-layout-spacer' }, [
                    m('select', {
                        value: this.viewModel.timeRange,
                        onchange: (e: Event) => { this.viewModel.timeRange = parseInt((<HTMLInputElement> e.target!).value, 10); },
                    }, this.createTimeRangeOption()),
                ]),
            ]),

            // 曜日チェックボックス
            m('div', {
                class: 'mdl-cell mdl-cell--12-col mdl-grid mdl-grid--no',
                style: 'margin-top: 12px; padding: 0;',
            }, [
                this.createCheckBox(
                    '月',
                    () => { return this.viewModel.mon; },
                    (value: boolean) => { this.viewModel.mon = value; },
                ),
                this.createCheckBox(
                    '火',
                    () => { return this.viewModel.tue; },
                    (value: boolean) => { this.viewModel.tue = value; },
                ),
                this.createCheckBox(
                    '水',
                    () => { return this.viewModel.wed; },
                    (value: boolean) => { this.viewModel.wed = value; },
                ),
                this.createCheckBox(
                    '木',
                    () => { return this.viewModel.thu; },
                    (value: boolean) => { this.viewModel.thu = value; },
                ),
                this.createCheckBox(
                    '金',
                    () => { return this.viewModel.fri; },
                    (value: boolean) => { this.viewModel.fri = value; },
                ),
                this.createCheckBox(
                    '土',
                    () => { return this.viewModel.sat; },
                    (value: boolean) => { this.viewModel.sat = value; },
                ),
                this.createCheckBox(
                    '日',
                    () => { return this.viewModel.sun; },
                    (value: boolean) => { this.viewModel.sun = value; },
                ),
            ]),
        ]);
    }

    /**
     * 開始時刻のオプション
     */
    private createStartTimeOption(): m.Child[] {
        const result = [ m('option', { value: '24' }, 'なし') ];
        for (let i = 0; i < 24; i++) { result.push(m('option', { value: `${ i }` }, `${ i }時`)); }

        return result;
    }

    /**
     * 時刻幅
     */
    private createTimeRangeOption(): m.Child[] {
        const result: m.Child[] = [];
        for (let i = 1; i < 24; i++) { result.push(m('option', { value: `${ i }` }, i + '時間')); }

        return result;
    }

    /**
     * 長さ
     */
    private createDuration(): m.Child {
        return this.createContentFrame('長さ', [
            m('div', { class: 'duration-box' }, [
                m('div', { class: 'duration-text' }, '最小(分)'),

                m('div', { class: 'option-text-box mdl-cell--12-col mdl-textfield mdl-js-textfield' }, [
                    m('input', {
                        class: 'mdl-textfield__input',
                        type: 'number', pattern: '-?[0-9]*(\.[0-9]+)?',
                        value: (() => {
                            if (this.viewModel.durationMin === 0) { return; }
                            else { return this.viewModel.durationMin; }
                        })(),
                        onchange: (e: Event) => {
                            let num = parseInt((<HTMLInputElement> e.target!).value, 10);
                            if (isNaN(num)) { num = 0; }
                            this.viewModel.durationMin = num;
                        },
                        onupdate: (vnode: m.VnodeDOM<void, this>) => {
                            this.inputNumberOnUpdate(<HTMLInputElement> vnode.dom, this.viewModel.durationMin);
                        },
                    }),
                ]),
            ]),

            m('div', { class: 'duration-box' }, [
                m('div', { class: 'duration-text' }, '最長(分)'),

                m('div', { class: 'option-text-box mdl-cell--12-col mdl-textfield mdl-js-textfield' }, [
                    m('input', {
                        class: 'mdl-textfield__input',
                        type: 'number', pattern: '-?[0-9]*(\.[0-9]+)?',
                        value: (() => {
                            if (this.viewModel.durationMax === 0) { return; }
                            else { return this.viewModel.durationMax; }
                        })(),
                        onchange: (e: Event) => {
                            let num = parseInt((<HTMLInputElement> e.target!).value, 10);
                            if (isNaN(num)) { num = 0; }
                            this.viewModel.durationMax = num;
                        },
                        onupdate: (vnode: m.VnodeDOM<void, this>) => {
                            this.inputNumberOnUpdate(<HTMLInputElement> vnode.dom, this.viewModel.durationMax);
                        },
                    }),
                ]),
            ]),
        ]);
    }

    /**
     * その他
     */
    private createOther(): m.Child {
        return this.createContentFrame('その他', [
            m('div', { style: 'margin-top: 12px;' } , [
                this.createCheckBox(
                    '無料放送のみ',
                    () => { return this.viewModel.isFree; },
                    (value: boolean) => { this.viewModel.isFree = value; },
                ),
            ]),
        ]);
    }

    /**
     * アクションボタン
     */
    private createActionButtons(): m.Child {
        return m('div', { class: 'mdl-dialog__actions mdl-card__actions mdl-card--border' }, [
            // 検索ボタン
            m('button', {
                class: 'no-hover mdl-button mdl-js-button mdl-button--primary',
                onclick: () => {this.viewModel.search(); },
            }, '検索'),

            // キャンセル or 元に戻すボタン
            m('button', {
                class: 'no-hover mdl-button mdl-js-button mdl-button--accent',
                onclick: () => {
                    this.viewModel.initSearchOption();
                    this.viewModel.clearSearchResults();
                },
            }, 'クリア'),
        ]);
    }
}

export default SearchOptionComponent;

